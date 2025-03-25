import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';
import { FaRobot, FaTimes, FaComments, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hi! I'm your car service assistant. How can I help you today?",
      options: [
        'Book a Service',
        'View Services',
        'Check Spare Parts',
        'Contact Information',
        'Operating Hours',
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    customerName: '',
    email: '',
    phoneNumber: '',
    service: '',
    date: '',
    time: '',
    message: '',
  });
  const [bookingStep, setBookingStep] = useState(0);
  const messagesEndRef = useRef(null);
  const [chatContext, setChatContext] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendChatbotQuery = async (query) => {
    try {
      const response = await axios.post('http://localhost:5001/api/chatbot/query', {
        query,
        userId: localStorage.getItem('userId'), // If you have user authentication
        context: chatContext
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return {
        response: response.data.data.response,
        options: response.data.data.options
      };
    } catch (error) {
      console.error('Error sending chatbot query:', error);
      return {
        response: "I'm sorry, but I'm having trouble connecting to the server. Please try again later.",
        options: ['Try Again', 'Contact Support']
      };
    }
  };

  const processChatbotAction = async (action) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/chatbot/action', {
        action,
        details: bookingData,
      });

      return response.data.data;
    } catch (error) {
      console.error('Error processing chatbot action:', error);
      return {
        response: "Sorry, I couldn't process that action. Please try again.",
        options: ['Try Again', 'Contact Support'],
      };
    } finally {
      setIsLoading(false);
    }
  };

  const bookAppointment = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/chatbot/book-appointment', {
        ...bookingData,
      });

      // Reset booking data and step
      setBookingData({
        customerName: '',
        email: '',
        phoneNumber: '',
        service: '',
        date: '',
        time: '',
        message: '',
      });
      setBookingStep(0);

      return response.data.data;
    } catch (error) {
      console.error('Error booking appointment:', error);
      return {
        response:
          "Sorry, I couldn't book your appointment. Please try again or contact us directly.",
        options: ['Try Again', 'Contact Support'],
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getAIResponse = async (userMessage) => {
    try {
      const response = await axios.post('http://localhost:5001/api/chatbot/query', {
        query: userMessage,
        context: chatContext
      });

      // Update chat context with the new interaction
      setChatContext(prev => [...prev, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response.data.data.response }
      ]);

      return response.data.data;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return {
        response: "I'm sorry, I'm having trouble understanding. Please try again.",
        options: ['Try Again', 'Contact Support']
      };
    }
  };

  // Validation functions
  const validateUserInput = (input) => {
    if (!input || typeof input !== 'string') {
      return { isValid: false, message: 'Please enter a valid message' };
    }
    if (input.length > 500) {
      return { isValid: false, message: 'Message must not exceed 500 characters' };
    }
    return { isValid: true };
  };

  const validateBookingStep = (step, value) => {
    switch (step) {
      case 1: // Name validation
        if (!value || value.length < 2) {
          return { isValid: false, message: 'Please enter a valid name (at least 2 characters)' };
        }
        break;
      case 2: // Email validation
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return { isValid: false, message: 'Please enter a valid email address' };
        }
        break;
      case 3: // Phone validation
        if (!value || !/^\+?[\d\s-]{10,}$/.test(value)) {
          return { isValid: false, message: 'Please enter a valid phone number' };
        }
        break;
      case 4: // Date validation
        if (!value) {
          return { isValid: false, message: 'Please select a valid date' };
        }
        break;
      case 5: // Time validation
        if (!value) {
          return { isValid: false, message: 'Please select a valid time' };
        }
        break;
      default:
        return { isValid: true };
    }
    return { isValid: true };
  };

  const handleUserInput = async (input, isOption = false) => {
    if (!input.trim()) return;

    // Validate user input
    const inputValidation = validateUserInput(input);
    if (!inputValidation.isValid) {
      setMessages(prev => [
        ...prev,
        { type: 'user', content: input },
        {
          type: 'bot',
          content: inputValidation.message,
          options: ['Try Again']
        }
      ]);
      return;
    }

    if (bookingStep > 0) {
      await handleBookingFlow(input.trim());
    } else {
      setMessages(prev => [...prev, { type: 'user', content: input }]);
      setInputValue('');
      setIsLoading(true);

      try {
        const aiResponse = await getAIResponse(input);
        setMessages(prev => [
          ...prev,
          {
            type: 'bot',
            content: aiResponse.response,
            options: aiResponse.options
          }
        ]);
      } catch (error) {
        console.error('Error handling user input:', error);
        setMessages(prev => [
          ...prev,
          {
            type: 'bot',
            content: 'Sorry, something went wrong. Please try again.',
            options: ['Try Again', 'Contact Support']
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      handleUserInput(inputValue.trim());
    }
  };

  const handleOptionClick = async (option) => {
    if (option === 'Book a Service' && bookingStep === 0) {
      // Start booking flow
      setMessages(prev => [
        ...prev,
        { type: 'user', content: option },
        {
          type: 'bot',
          content: 'Please select the service you need:',
          options: [
            'Oil Change Service - $49.99',
            'Brake Service - $129.99',
            'Tire Rotation - $39.99',
            'Full Car Inspection - $89.99'
          ]
        }
      ]);
      setBookingStep(0);
    } else if (bookingStep >= 0) {
      // Continue booking flow
      await handleBookingFlow(option);
    } else {
      // Handle other options
      await handleUserInput(option, true);
    }
  };

  const handleBookingFlow = async (option) => {
    try {
      setIsLoading(true);
      let botResponse;
      let aiResponse;

      // Validate the input for the current booking step
      const validation = validateBookingStep(bookingStep, option);
      if (!validation.isValid) {
        botResponse = {
          type: 'bot',
          content: validation.message,
          options: ['Try Again', 'Cancel Booking']
        };
        setMessages(prev => [...prev, { type: 'user', content: option }, botResponse]);
        return;
      }

      switch (bookingStep) {
        case 0: // Initial service selection
          setBookingData(prev => ({ ...prev, service: option }));
          aiResponse = await getAIResponse(`I want to book ${option}`);
          botResponse = {
            type: 'bot',
            content: aiResponse.response,
            options: ['Continue with booking', 'Cancel']
          };
          setBookingStep(1);
          break;

        case 1: // Name entered
          setBookingData(prev => ({ ...prev, customerName: option }));
          botResponse = {
            type: 'bot',
            content: 'Please enter your email address:',
            options: []
          };
          setBookingStep(2);
          break;

        case 2: // Email entered
          setBookingData(prev => ({ ...prev, email: option }));
          botResponse = {
            type: 'bot',
            content: 'Please enter your phone number:',
            options: []
          };
          setBookingStep(3);
          break;

        case 3: // Phone entered
          setBookingData(prev => ({ ...prev, phoneNumber: option }));
          botResponse = {
            type: 'bot',
            content: 'Please select your preferred date:',
            options: ['Today', 'Tomorrow', 'Select Different Date']
          };
          setBookingStep(4);
          break;

        case 4: // Date selection
          let selectedDate;
          if (option === 'Today') {
            selectedDate = new Date().toISOString().split('T')[0];
          } else if (option === 'Tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            selectedDate = tomorrow.toISOString().split('T')[0];
          } else {
            // Handle custom date input
            selectedDate = option;
          }
          setBookingData(prev => ({ ...prev, date: selectedDate }));
          botResponse = {
            type: 'bot',
            content: 'Please select your preferred time:',
            options: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM']
          };
          setBookingStep(5);
          break;

        case 5: // Time selected
          setBookingData(prev => ({ ...prev, time: option }));
          botResponse = {
            type: 'bot',
            content: 'Any additional message or special requirements?',
            options: ['No additional message', 'Type your message']
          };
          setBookingStep(6);
          break;

        case 6: // Message/confirmation
          const message = option === 'No additional message' ? '' : option;
          setBookingData(prev => ({ ...prev, message }));
          
          // Show booking summary
          botResponse = {
            type: 'bot',
            content: `Please confirm your booking details:\n
Service: ${bookingData.service}
Name: ${bookingData.customerName}
Email: ${bookingData.email}
Phone: ${bookingData.phoneNumber}
Date: ${bookingData.date}
Time: ${bookingData.time}
Message: ${message}`,
            options: ['Confirm Booking', 'Cancel']
          };
          setBookingStep(7);
          break;

        case 7: // Final confirmation
          if (option === 'Confirm Booking') {
            const response = await axios.post('http://localhost:5001/api/chatbot/book-appointment', bookingData);
            
            if (response.data.success) {
              aiResponse = await getAIResponse('Booking confirmed successfully');
              botResponse = {
                type: 'bot',
                content: aiResponse.response,
                options: ['Book Another Service', 'Return to Main Menu']
              };
            } else {
              throw new Error('Booking failed');
            }
            
            // Reset states
            setBookingData({
              customerName: '',
              email: '',
              phoneNumber: '',
              service: '',
              date: '',
              time: '',
              message: ''
            });
            setBookingStep(0);
            setChatContext([]);
          } else {
            aiResponse = await getAIResponse('Cancel booking');
            botResponse = {
              type: 'bot',
              content: aiResponse.response,
              options: ['Book a Service', 'View Services', 'Contact Information']
            };
            setBookingStep(0);
            setChatContext([]);
          }
          break;
      }

      setMessages(prev => [
        ...prev,
        { type: 'user', content: option },
        botResponse
      ]);

    } catch (error) {
      console.error('Booking flow error:', error);
      const aiResponse = await getAIResponse('Error in booking');
      setMessages(prev => [
        ...prev,
        {
          type: 'bot',
          content: aiResponse.response,
          options: ['Try Again', 'Contact Support']
        }
      ]);
      setBookingStep(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chat Toggle Button */}
      <button
        className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaComments />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <FaRobot className="bot-icon" />
            <span>Revvy - Car Service Assistant</span>
            <FaTimes className="close-icon" onClick={() => setIsOpen(false)} />
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                {message.type === 'loading' ? (
                  <div className="loading-indicator">
                    <FaSpinner className="spinner-icon" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <>
                    <div className="message-content">{message.content}</div>
                    {message.options && message.options.length > 0 && (
                      <div className="message-options">
                        {message.options.map((option, optIndex) => (
                          <button
                            key={optIndex}
                            onClick={() => handleOptionClick(option)}
                            className="option-button"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading && inputValue.trim()) {
                  handleUserInput(inputValue);
                }
              }}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button 
              onClick={() => handleUserInput(inputValue)}
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? <FaSpinner className="spinner-icon" /> : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;

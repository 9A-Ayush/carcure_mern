export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;  // Assumes 10-digit phone number
  if (!phone) return "Phone number is required";
  if (!phoneRegex.test(phone)) return "Please enter a valid 10-digit phone number";
  return "";
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

export const validateName = (name) => {
  if (!name) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters long";
  if (!/^[a-zA-Z\s]*$/.test(name)) return "Name should only contain letters";
  return "";
};

export const validateMessage = (message) => {
  if (!message) return "Message is required";
  if (message.length < 10) return "Message must be at least 10 characters long";
  return "";
};

export const validateDate = (date) => {
  if (!date) return "Date is required";
  const selectedDate = new Date(date);
  const today = new Date();
  if (selectedDate < today) return "Please select a future date";
  return "";
};

export const validateTime = (time) => {
  if (!time) return "Time is required";
  const [hours] = time.split(':');
  if (hours < 9 || hours > 17) return "Please select a time between 9 AM and 5 PM";
  return "";
};

export const validateService = (service) => {
  if (!service) return "Please select a service";
  return "";
}; 
const generateVerificationToken = (
  length = 20,
  characters = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890",
) => {
  let token = "";
  for (let i = 0; i < length; i++) {
    token += characters[Math.floor(Math.random() * characters.length)];
  }
  return token;
};

export default generateVerificationToken;

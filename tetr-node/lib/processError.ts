const processError = (e: string | any) => {
  try {
    const res = e
      .toLowerCase()
      .replaceAll("you are", "bot is")
      .replaceAll("you", "bot");
    return res.slice(0, 1).toUpperCase() + res.slice(1);
  } catch {
    try {
      const res = e.message
        .toLowerCase()
        .replaceAll("you are", "bot is")
        .replaceAll("you", "bot");
      return res.slice(0, 1).toUpperCase() + res.slice(1);
    } catch {
      return e;
    }
  }
};

export default processError;

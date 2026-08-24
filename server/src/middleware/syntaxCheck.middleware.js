import { checkSyntax } from "../services/syntaxCheck.service.js";

const syntaxCheckMiddleware = async (req, res, next) => {
  try {
    const { code } = req.body;
    const language = req.body.language || req.body.sourceLanguage;

    if (!code || !language) {
      return next();
    }

    const result = await checkSyntax(code, language);

    if (result && result.valid === false) {
      return res.status(422).json({
        success: false,
        message: "Syntax error detected — code was not sent to the AI.",
        error: result.errors,
      });
    }

    return next();
  } catch (error) {
    console.error("Syntax check middleware error (failing open):", error.message);
    return next();
  }
};

export default syntaxCheckMiddleware;
const jwt = require("jsonwebtoken");

const AuthMiddleware = (req, res, next) => {
  // 1. التحقق من التوكن في الكوكيز======================================================
  const cookiesToken = req.cookies?.token;
  // إذا كنت تستخدم الكوكيز لتخزين التوكن (تأكد من استخدام middleware مثل cookie-parser)
  //  وبنستخدم في الفرونت اند axios.defaults.withCredentials = true;

  // 2. التحقق من التوكن في الهيدر باستخدام Regex دقيق===============================================
  const authHeader = req.header("authorization");
  const headerMatch = authHeader ? authHeader.match(/^Bearer\s+(.*)$/i) : null;
  const headerToken = headerMatch ? headerMatch[1] : null;
  // أو req.headers['authorization']
  // وبنستخدم معاها في الفرونت اند axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  // اختيار التوكن من الكوكيز أو الهيدر=========================================================
  const token = cookiesToken || headerToken;
  // 2 إرجاع الاستجابة في حالة عدم وجود توكن========================================================
  if (!token) {
    return res.status(401).json({ error: "no token provided" });
  }
  try {
    // 3. استخدام jwt.verify لفحص التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // يمكن تخزين id المستخدم مباشرة في req.user
    // (إذا كانت الـ payload تحتوي على { id: user._id })
    console.log(decoded);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error("❌ JWT verification error:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = { AuthMiddleware };

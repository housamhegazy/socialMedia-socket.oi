const jwt = require("jsonwebtoken");

const AuthMiddleware = (req, res, next) => {
    // 1. استبدال 'Bearer' الصحيحة وإزالة المسافات البيضاء
    // هذا إذا كنت ترسل التوكن في الهيدر
    // const headertToken = req.header("authorization")?.replace("Bearer", "").trim(); // نضيف في الفرونت كود هيدر بهذا الشكل: { Authorization: `Bearer ${token}` }
    // هذا إذا كنت تستخدم الكوكيز لتخزين التوكن وهو اكثر أماناً في بعض الحالات
    const cookiesToken = req.cookies?.token ; // نضيف في الفرونت كود الكوكيز   withCredentials: true
    const token = cookiesToken;
    // 2. إرجاع الاستجابة في حالة عدم وجود توكن
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


// 4. تصدير الكود بصيغة CommonJS
module.exports = { AuthMiddleware };
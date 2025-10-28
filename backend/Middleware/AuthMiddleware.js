const jwt = require("jsonwebtoken");

const AuthMiddleware = (req, res, next) => {
    // 1. استبدال 'Bearer' الصحيحة وإزالة المسافات البيضاء
    const token = req.header("authorization")?.replace("Bearer", "").trim();

    // 2. إرجاع الاستجابة في حالة عدم وجود توكن
    if (!token) {
        return res.status(401).json({ error: "no token provided" });
    }
    try {
        // 3. استخدام jwt.verify لفحص التوكن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // يمكن تخزين id المستخدم مباشرة في req.user
        // (إذا كانت الـ payload تحتوي على { id: user._id })
        req.user = decoded; 
        
        next();
    } catch (error) {
        // في حال فشل التحقق (انتهاء الصلاحية، توقيع خاطئ...)
        return res.status(401).json({ error: "invalid token" });
    }
};


// 4. تصدير الكود بصيغة CommonJS
module.exports = { AuthMiddleware };
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.json());

// إعداد الاتصال بقاعدة البيانات
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // ضع كلمة المرور الخاصة بقاعدة البيانات هنا
    database: 'user_management'
});

// التحقق من الاتصال بقاعدة البيانات
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

// تسجيل المستخدم
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // التحقق من أن البريد الإلكتروني غير مستخدم مسبقًا
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (results.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // إدخال المستخدم الجديد
        db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            (err) => {
                if (err) return res.status(500).json({ message: 'Database error' });

                res.status(201).json({ message: 'User registered successfully!' });
            }
        );
    });
});

// تسجيل الدخول
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = results[0];

        // مقارنة كلمة المرور المُدخلة مع كلمة المرور المشفرة
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful!' });
    });
});

// بدء الخادم
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
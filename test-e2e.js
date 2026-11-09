
const BASE_URL = "http://localhost:5001/api";

// Helper function for API requests
async function api(endpoint, options = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const text = await response.text();

    let data = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        throw new Error(`Invalid JSON response from ${endpoint}`);
    }

    if (!response.ok) {
        throw new Error(
            `${endpoint} failed (${response.status}): ${JSON.stringify(data)}`
        );
    }

    return data;
}

// Test headers
function authHeaders(token) {
    return {
        Authorization: `Bearer ${token}`
    };
}

// Main E2E testing function
async function runTests() {
    console.log("\n========================================");
    console.log(" ONLINE EXAM SYSTEM - FULL E2E TEST");
    console.log("========================================\n");

    // 1. STUDENT REGISTRATION
    console.log("1. Testing Student Registration...");

    const testEmail = `student_${Date.now()}@exam.com`;

    const regData = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
            name: "Test Candidate",
            email: testEmail,
            password: "password123",
            role: "STUDENT",
            classGroup: "CS-2026-A"
        })
    });

    if (!regData.token) {
        throw new Error("Student registration failed");
    }

    const studentToken = regData.token;
    const studentHeaders = authHeaders(studentToken);

    console.log("PASS: Student registered:", testEmail);

    // 2. STUDENT LOGIN
    console.log("\n2. Testing Student Login...");

    const loginData = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email: testEmail,
            password: "password123"
        })
    });

    if (!loginData.token) {
        throw new Error("Student login failed");
    }

    console.log("PASS: Student login successful");

    // 3. FETCH AVAILABLE EXAMS
    console.log("\n3. Fetching Available Exams...");

    const exams = await api("/exams/available", {
        headers: studentHeaders
    });

    if (!Array.isArray(exams) || exams.length === 0) {
        throw new Error(
            "No available exams. Create and schedule an exam first."
        );
    }

    const targetExam = exams[0];

    console.log("PASS: Available exams:", exams.length);
    console.log("Exam:", targetExam.title);

    // 4. START EXAM
    console.log("\n4. Starting Examination...");

    const session = await api(
        `/exams/${targetExam.id}/start`,
        {
            method: "POST",
            headers: studentHeaders
        }
    );

    if (!session.attemptId || !Array.isArray(session.questions)) {
        throw new Error("Exam session could not be started");
    }

    console.log("PASS: Exam started");
    console.log("Attempt ID:", session.attemptId);
    console.log("Questions:", session.questions.length);

    // 5. SAVE ANSWERS
    console.log("\n5. Testing Answer Submission...");

    for (let i = 0; i < session.questions.length; i++) {
        const question = session.questions[i];

        const selectedOption = ["B", "B", "C"][i % 3];

        await api(
            `/exams/attempts/${session.attemptId}/answer`,
            {
                method: "PUT",
                headers: studentHeaders,
                body: JSON.stringify({
                    questionId: question.id,
                    selectedOption
                })
            }
        );

        console.log(`PASS: Answer saved for Question ${i + 1}`);
    }

    // 6. AI PROCTORING TEST
    console.log("\n6. Testing AI Proctoring Events...");

    const violations = [
        {
            type: "TAB_SWITCH",
            description: "Test tab switching event"
        },
        {
            type: "NO_FACE_DETECTED",
            description: "Test face absence event"
        }
    ];

    for (const violation of violations) {
        const result = await api("/proctoring/violation", {
            method: "POST",
            headers: studentHeaders,
            body: JSON.stringify({
                attemptId: session.attemptId,
                examId: targetExam.id,
                ...violation
            })
        });

        console.log(
            "PASS: Proctoring event logged:",
            result.violation?.type || violation.type
        );
    }

    // 7. SUBMIT EXAM
    console.log("\n7. Testing Exam Submission...");

    const submitData = await api(
        `/exams/attempts/${session.attemptId}/submit`,
        {
            method: "POST",
            headers: studentHeaders
        }
    );

    console.log("PASS: Examination submitted");
    console.log("Score:", submitData.score);
    console.log("Total Marks:", submitData.totalMarks);

    // 8. VIEW RESULT
    console.log("\n8. Testing Student Result...");

    const resultData = await api(
        `/exams/attempts/${session.attemptId}/result`,
        {
            headers: studentHeaders
        }
    );

    console.log("PASS: Result retrieved");
    console.log("Score:", resultData.score);
    console.log("Violations:", resultData.violationsCount);

    // 9. STUDENT EXAM HISTORY
    console.log("\n9. Testing Student Exam History...");

    const history = await api("/exams/history", {
        headers: studentHeaders
    });

    console.log("PASS: Exam history retrieved");
    console.log("Completed Attempts:", history.length);

    // 10. FACULTY LOGIN
    console.log("\n10. Testing Faculty Login...");

    const facultyAuth = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email: "faculty@exam.com",
            password: "faculty123"
        })
    });

    if (!facultyAuth.token) {
        throw new Error("Faculty login failed");
    }

    const facultyHeaders = authHeaders(facultyAuth.token);

    console.log("PASS: Faculty login successful");

    // 11. FACULTY QUESTION BANK
    console.log("\n11. Testing Faculty Question Banks...");

    const questionBanks = await api(
        "/faculty/question-banks",
        {
            headers: facultyHeaders
        }
    );

    console.log("PASS: Question banks retrieved");
    console.log("Total Banks:", questionBanks.length);

    // 12. FACULTY LIVE MONITOR
    console.log("\n12. Testing Faculty Live Monitor...");

    const monitor = await api(
        `/faculty/exams/${targetExam.id}/live-monitor`,
        {
            headers: facultyHeaders
        }
    );

    console.log("PASS: Live monitor retrieved");
    console.log(
        "Students Tracked:",
        monitor.students?.length || 0
    );

    // 13. FACULTY PROCTORING REVIEW
    console.log("\n13. Testing Faculty Proctoring Review...");

    const facultyViolations = await api(
        "/faculty/violations",
        {
            headers: facultyHeaders
        }
    );

    console.log("PASS: Faculty violations retrieved");
    console.log("Total Events:", facultyViolations.length);

    // 14. ADMIN LOGIN
    console.log("\n14. Testing Admin Login...");

    const adminAuth = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email: "admin@exam.com",
            password: "admin123"
        })
    });

    if (!adminAuth.token) {
        throw new Error("Admin login failed");
    }

    const adminHeaders = authHeaders(adminAuth.token);

    console.log("PASS: Admin login successful");

    // 15. ADMIN DASHBOARD STATISTICS
    console.log("\n15. Testing Admin Dashboard...");

    const stats = await api("/admin/stats", {
        headers: adminHeaders
    });

    console.log("PASS: Admin statistics retrieved");
    console.log(stats);

    // 16. ADMIN USER MANAGEMENT
    console.log("\n16. Testing Admin User Management...");

    const users = await api("/admin/users", {
        headers: adminHeaders
    });

    console.log("PASS: Users retrieved");
    console.log("Total Users:", users.length);

    // 17. ADMIN REPORTS
    console.log("\n17. Testing Admin Reports...");

    const reports = await api("/admin/reports", {
        headers: adminHeaders
    });

    console.log("PASS: Reports retrieved");
    console.log("Total Reports:", reports.length);

    // 18. ADMIN PROCTORING EVENTS
    console.log("\n18. Testing Admin Proctoring Events...");

    const allViolations = await api(
        "/admin/violations",
        {
            headers: adminHeaders
        }
    );

    console.log("PASS: Admin violations retrieved");
    console.log("Total Violations:", allViolations.length);

    // FINAL RESULT
    console.log("\n========================================");
    console.log("       ALL E2E TESTS COMPLETED");
    console.log("========================================");
    console.log("Student Registration : PASS");
    console.log("Student Login        : PASS");
    console.log("Available Exams      : PASS");
    console.log("Start Examination    : PASS");
    console.log("Save Answers         : PASS");
    console.log("AI Proctoring        : PASS");
    console.log("Submit Examination   : PASS");
    console.log("Result Evaluation    : PASS");
    console.log("Exam History         : PASS");
    console.log("Faculty Module       : PASS");
    console.log("Admin Module          : PASS");
    console.log("========================================\n");
}

// Execute tests
runTests().catch(error => {
    console.error("\n❌ E2E TEST FAILED!");
    console.error(error.message);
    process.exit(1);
});

#!/bin/bash
echo "🚀 Quick Login Credentials"
echo "=========================="
if [ -f "generated_passwords.json" ]; then
    echo "Admin Login:"
    cat generated_passwords.json | jq -r '.login_examples[] | select(.role == "Admin") | "Email: \(.email)\nPassword: \(.password)\n"'
    echo ""
    echo "Teacher Login:"  
    cat generated_passwords.json | jq -r '.login_examples[] | select(.role == "Teacher") | "Email: \(.email)\nPassword: \(.password)\n"'
    echo ""
    echo "Student Login:"
    cat generated_passwords.json | jq -r '.login_examples[] | select(.role == "Student") | "Email: \(.email)\nPassword: \(.password)\n"'
else
    echo "No password file found. Run seeder first."
fi
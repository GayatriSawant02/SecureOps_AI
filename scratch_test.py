import sys
import os

# Add the project root to python path to allow imports
sys.path.insert(0, r"c:\Users\hp\Desktop\PROJECT\Secure-Ops.AI")

from Backend.analyzer import analyze_logs

with open(r"c:\Users\hp\Desktop\PROJECT\Secure-Ops.AI\test_log.txt", "r") as f:
    text = f.read()

result = analyze_logs(text)
print("Analysis Result:")
print(result)

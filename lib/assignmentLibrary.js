/**
 * GReg IDE — Assignment Library
 * Pre-coded C++ templates for educational use.
 */

export const ASSIGNMENTS = [
  {
    id: "circle",
    icon: "⭕",
    label: "Circle Metrics",
    category: "Math",
    difficulty: "Easy",
    description: "Calculate area and circumference",
    code: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    const double PI = 3.14159265358979;
    double radius;
    
    cout << "=== Circle Metrics ===" << endl;
    cout << "Enter radius: ";
    cin >> radius;
    
    double area          = PI * radius * radius;
    double circumference = 2 * PI * radius;
    
    cout << "Radius        : " << radius        << endl;
    cout << "Area          : " << area          << endl;
    cout << "Circumference : " << circumference << endl;
    
    return 0;
}`,
  },
  {
    id: "factorial",
    icon: "🔢",
    label: "Factorial",
    category: "Math",
    difficulty: "Easy",
    description: "Recursive and iterative factorial",
    code: `#include <iostream>
using namespace std;

long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    int number;
    
    cout << "=== Factorial Calculator ===" << endl;
    cout << "Enter a number: ";
    cin >> number;
    
    if (number < 0) {
        cout << "Error: negative input" << endl;
    } else {
        cout << number << "! = " << factorial(number) << endl;
    }
    
    return 0;
}`,
  },
  {
    id: "prime",
    icon: "🔍",
    label: "Prime Checker",
    category: "Number Theory",
    difficulty: "Easy",
    description: "Check if a number is prime",
    code: `#include <iostream>
#include <cmath>
using namespace std;

bool isPrime(int n) {
    if (n < 2) return false;
    if (n == 2) return true;
    if (n % 2 == 0) return false;
    for (int i = 3; i <= sqrt(n); i += 2) {
        if (n % i == 0) return false;
    }
    return true;
}

int main() {
    int number;
    
    cout << "=== Prime Number Checker ===" << endl;
    cout << "Enter a number: ";
    cin >> number;
    
    cout << number << " is " << (isPrime(number) ? "" : "NOT ") << "prime." << endl;
    
    return 0;
}`,
  },
  {
    id: "grade",
    icon: "📊",
    label: "Grade Evaluator",
    category: "Logic",
    difficulty: "Easy",
    description: "Evaluate letter grade from score",
    code: `#include <iostream>
#include <string>
using namespace std;

string evaluateGrade(double score) {
    if      (score >= 90) return "A";
    else if (score >= 80) return "B";
    else if (score >= 70) return "C";
    else if (score >= 60) return "D";
    else                  return "F";
}

int main() {
    double score;
    
    cout << "=== Grade Evaluator ===" << endl;
    cout << "Enter score (0-100): ";
    cin >> score;
    
    cout << "Score : " << score               << endl;
    cout << "Grade : " << evaluateGrade(score) << endl;
    
    return 0;
}`,
  },
  {
    id: "fibonacci",
    icon: "🌀",
    label: "Fibonacci",
    category: "Sequences",
    difficulty: "Medium",
    description: "Generate Fibonacci series",
    code: `#include <iostream>
using namespace std;

int main() {
    int n;
    
    cout << "=== Fibonacci Series ===" << endl;
    cout << "How many terms? ";
    cin >> n;
    
    long long a = 0, b = 1;
    cout << "Series: ";
    for (int i = 0; i < n; i++) {
        cout << a;
        if (i < n - 1) cout << ", ";
        long long temp = a + b;
        a = b;
        b = temp;
    }
    cout << endl;
    
    return 0;
}`,
  },
  {
    id: "bubblesort",
    icon: "📈",
    label: "Bubble Sort",
    category: "Algorithms",
    difficulty: "Medium",
    description: "Sort array using Bubble Sort",
    code: `#include <iostream>
using namespace std;

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

int main() {
    int n;
    cout << "=== Bubble Sort ===" << endl;
    cout << "Array size: ";
    cin >> n;
    
    int arr[100];
    cout << "Enter " << n << " elements: ";
    for (int i = 0; i < n; i++) cin >> arr[i];
    
    bubbleSort(arr, n);
    
    cout << "Sorted: ";
    for (int i = 0; i < n; i++) cout << arr[i] << (i < n-1 ? " " : "\n");
    
    return 0;
}`,
  },
  {
    id: "linkedlist",
    icon: "🔗",
    label: "Linked List",
    category: "Data Structures",
    difficulty: "Hard",
    description: "Singly linked list with CRUD",
    code: `#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int d) : data(d), next(nullptr) {}
};

class LinkedList {
    Node* head;
public:
    LinkedList() : head(nullptr) {}
    
    void push(int d) {
        Node* n = new Node(d);
        n->next = head;
        head = n;
    }
    
    void print() {
        Node* cur = head;
        while (cur) {
            cout << cur->data;
            if (cur->next) cout << " -> ";
            cur = cur->next;
        }
        cout << " -> NULL" << endl;
    }
    
    ~LinkedList() {
        while (head) {
            Node* t = head;
            head = head->next;
            delete t;
        }
    }
};

int main() {
    LinkedList list;
    cout << "=== Linked List Demo ===" << endl;
    
    for (int v : {5, 10, 15, 20, 25}) list.push(v);
    
    cout << "List: ";
    list.print();
    
    return 0;
}`,
  },
  {
    id: "matrix",
    icon: "🔲",
    label: "Matrix Multiply",
    category: "Linear Algebra",
    difficulty: "Hard",
    description: "2×2 matrix multiplication",
    code: `#include <iostream>
using namespace std;

void multiplyMatrix(int A[2][2], int B[2][2], int C[2][2]) {
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 2; j++) {
            C[i][j] = 0;
            for (int k = 0; k < 2; k++)
                C[i][j] += A[i][k] * B[k][j];
        }
}

void printMatrix(int M[2][2], const string& name) {
    cout << name << ":" << endl;
    for (int i = 0; i < 2; i++) {
        cout << "  [ ";
        for (int j = 0; j < 2; j++) cout << M[i][j] << " ";
        cout << "]" << endl;
    }
}

int main() {
    int A[2][2] = {{1, 2}, {3, 4}};
    int B[2][2] = {{5, 6}, {7, 8}};
    int C[2][2];
    
    cout << "=== Matrix Multiplication ===" << endl;
    printMatrix(A, "Matrix A");
    printMatrix(B, "Matrix B");
    multiplyMatrix(A, B, C);
    printMatrix(C, "Result C = A×B");
    
    return 0;
}`,
  },
];

export const CATEGORIES = [...new Set(ASSIGNMENTS.map(a => a.category))];
export const DIFFICULTIES = ["Easy", "Medium", "Hard"];

#include <iostream>
#include <algorithm>
using namespace std;

int N;
int A[20];

int main() {
  cin >> N;
  for (int i = 1; i <= N; ++i) cin >> A[i];
  sort(A + 1, A + N + 1);
  for (int i = 1; i <= N; ++i) cout << A[i] << ' ';
  cout << endl;
}

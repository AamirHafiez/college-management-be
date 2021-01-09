# college-management-be
* This is the back end apis for the college management system.
* The front end for this appliaction can be found on the link:- https://github.com/AamirHafiez/college-management-fe

## About
College management system is a web app that is used by the student and the teacher of a particular college to interact for the assignments. \
It has certain functionalities such as :-
1. Registration of User (Teacher or Student) 
2. User authentication using Passport JWT strategy 
2. Edit profiles 
3. Teacher can - \
   3.1 Create new assignment \
   3.2 View Submissions \
   3.3 Download submitted assignments \
   3.4 Grade students based on assignments
4. Student can - \
   4.1 View upcoming assignments based on deadlines \
   4.2 Submit upcoming assignments as PDFs \
   4.3 View grades given by teacher for a particular assignment 
5. Logout 
6. It is not possible to go to dashboard with logging in or got to home without signing out 

# intall all dependencies using:-
npm install

# run the script to run this app:-
npm start
The application runs on the port number 8000.

# This app containes various apis having routes as follows:-
1. createStudent: http://localhost:8000/api/v1/student/create,
2. createTeacher: http://localhost:8000/api/v1/teacher/create,
3. studentLogin: http://localhost:8000/api/v1/student/login,
4. teacherLogin: http://localhost:8000/api/v1/teacher/login,
5. getUserDetails: http://localhost:8000/api/v1/user-details,
6. updateStudentDetails: http://localhost:8000/api/v1/student/update-details,
7. updateTeacherDetails: http://localhost:8000/api/v1/teacher/update-details,
8. addAssignment: http://localhost:8000/api/v1/teacher/add-assignment,
9. getUpcomingAssignments: http://localhost:8000/api/v1/student/upcoming-assignments,
10. uploadAssignmentPDF : http://localhost:8000/api/v1/student/upload-assignment,
11. getSubmittedAssignments: http://localhost:8000/api/v1/student/get-submitted-assignments,
12. getTeacherAssignments: http://localhost:8000/api/v1/teacher/get-assignments,
13. getSubmissions: http://localhost:8000/api/v1/teacher/view-submissions,
14. addGrade: http://localhost:8000/api/v1/teacher/add-grade,
15. getGrade: http://localhost:8000/api/v1/student/get-grade, \
16 .downloadPDF : http://localhost:8000/api/v1/teacher/download 

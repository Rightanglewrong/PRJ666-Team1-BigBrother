# PRJ666 Project
# Big Brother Inc.

## Members
* Benny Yang: 112654223
* Justin Lee: 121354229
* Steven Zhang: 117054171
* Alex Choi 177037215

## Executive Summary
  The "Big Brother" project was initiated in response to utilizing various tools to communicate with parents, track daily activities, manage health updates, and monitor developmental milestones. Our project aims to introduce a centralized solution that streamlines daycare management tasks while supporting educational objectives, thereby enhancing both the operational efficiency of daycare centers and the developmental outcomes for children.

## Description
  A centralized daycare management system that allows for the management and entry of data for the teachers on their students in attendance. Allowing for the logging of progress, activities, videos, pictures, and personal details of each student within the daycare and the communication of stored information to their respective parents.

## Value Statement
  An increased efficiency and management in data keeping and analysis in the field of child daycares. A streamlined application that will provide an intuitive and secure platform available for all child daycare providers that aims to make information access and recording as easy and efficient as possible.   

## Scope
### What is Included
* Web platform
* Image and Video storage
* Templated data entry forms
* Ai power activity suggestions
  * Based on progress reports
* Child Development Progress Reports 
  * Interests 
  * Habits
  * Weaknesses 
  * Trending
* Email notifications
* Account Administration
* Account creation
* Child data history (6 years) 
* Meal tracking and menu reporting
* Washroom and hydration tracking 
* Preset text and choice options for quick data entry 
  
### What is Not Included
* IOS application
* Inventory management
* Staff scheduling
* Payroll
* Operational capabilities

## Tech Stack
### Backend
* NodeJS
* AWS S3
* AWS DynamoDB
* OPENAI
### Frontend
* Material UI
* NextJS
* React

## Milestones
### Milestone 1: Backend Implementation
* Complete the database setup
* Implement login functionality
* Finish implementation of account permissions
* Develop a basic tester page
### Milestone 2: Method Implementation
* Implement business logic
* Create admin-only functionality
* Establish child report distribution
* Connect to an Email Server
* Implement data encryption
* Develop report send-off and confirmation
### Milestone 3: Frontend Development
* Build UI components
* Develop the login page
* Establish user routes
* Implement media functionality
* Integrate the frontend with the backend
* Conduct integration testing
* Ensure mobile accessibility
### Milestone 4: Closing
* Complete final testing
* Finalize all documentation
* Prepare and deliver the project presentation

## Link to Backend API
For the backend API code and instructions
* https://github.com/Rightanglewrong/PRJ666-Team1-BigBrother-Backend

## Technical Documents
For our UI design references
* https://www.figma.com/design/Wsyb8fYVWp7U8yHlzy8MAJ/PRJ5---Big-Brother?node-id=0-1&t=TM8w3RdTPOnibaq2-1 
  
For our Data Flow Diagrams, Activity Diagram, Class Diagrams and workflow specifications
* https://www.figma.com/board/qz6547qvOFw6dnzL0PVWww/Big-Brother?t=TM8w3RdTPOnibaq2-1

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## List of deviations from original PRJ566 Plan
* Ability to deny user messaging was not implemented
* Progress report templates was cut back on in complexity and availability of options
* AWS Cognito was replaced with homebrew authentication and authorization implementation

## How To Run
The application is currently hosted on Heroku for the backend and Vercel for the frontend.
* For the frontend, visit: https://prj-666-team1-big-brother.vercel.app/ 
* For the backend, visit: https://big-brother-be-3d6ad173758c.herokuapp.com/
  
### A list of user login and password for public testing as well as their roles and the associated locationID

| Email                      | Password   | Role   | Location |
|----------------------------|------------|--------|----------|
| Kevin205@hotmail.com       | Apple!     | Admin  | L6E0B21  |
| Sarah210@hotmail.com       | Apple!     | Admin  | L6E0B21  |
| Green100@hotmail.com       | Apple!     | Staff  | L6E0B21  |
| Nancy900@hotmail.com       | Apple!     | Staff  | L6E0B21  |
| rahul.sharma@hotmail.com   | Apple123!  | Parent | L6E0B21  |
| minjoon.kim.1224@gmail.com | Apple123!  | Parent | L6E0B21  |

The user is also able to register their own account should they desire to. 

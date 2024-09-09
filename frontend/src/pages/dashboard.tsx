import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      {/* Welcome Message */}
      <div className="bg-terminal-dark text-terminal p-6 rounded-lg mb-6 shadow-lg">
        <h1 className="text-3xl font-primary mb-4">Welcome to MeshCode</h1>
        <p className="text-white text-lg">
          MeshCode is your online platform for collaborative coding. You can create projects, collaborate with others, and run your code in a safe environment.
        </p>
      </div>

      {/* Directions */}
      <div className="bg-grey p-6 rounded-lg mb-6 shadow-lg">
        <h2 className="text-2xl font-secondary mb-4">How to Get Started</h2>
        <ul className="list-disc pl-6 text-white">
          <li className="mb-2">Click on the "Project" tab on the sidebar to navigate to the project page.</li>
          <li className="mb-2">To create a new project, click on the "New Project" button at the top of the screen.</li>
          <li className="mb-2">Name your project and give it a description.</li>
          <li className="mb-2">Once your project is created, you can access the project by clicking on the name.</li>
          <li className="mb-2">You can add files and folders in the file explorer on the left-hand side.</li>
          <li className="mb-2">Use the terminal to run commands like <code>npm start</code> or <code>npm install</code> for your project.</li>
          <li className="mb-2">Invite collaborators by adding their userId or username to the project settings.</li>
        </ul>
      </div>

    </div>
  );
};

export default Dashboard;

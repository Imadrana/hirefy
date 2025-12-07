import React, { useEffect, useState } from "react";
import "./App.css";
import { db } from "./firebase"; // 👈 make sure firebase.js is in src/
import { collection, getDocs } from "firebase/firestore"; // Firestore functions

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users from Firestore
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>👋 Firebase + React</h1>
        <p>This data comes from your Firestore database:</p>

        {users.length > 0 ? (
          <ul>
            {users.map((user) => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        ) : (
          <p>No users found (yet)</p>
        )}
      </header>
    </div>
  );
}

export default App;

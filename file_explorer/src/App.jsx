import React, { useState, useRef, useEffect } from 'react';
import { explorer as initialExplorer } from './utils/explorer';

const generateFolders = (parent, createFolder, createFile, expandedFolders, handleExpandFolder, handleCreateFolder, handleCreateFile, name, setName, handleAddFolder, inputRef, handleDelete, renameInput, setRenameInput, newName, setNewName, handleRename, renameRef) => {
  return Object.keys(parent).map((child) => {
    const childData = parent[child];
    const expanded = expandedFolders.includes(child);

    return (
      <div key={child} style={{ display: "flex", flexDirection: "column", gap: "4px", userSelect: "none" }}>
        {childData.type === "Folder" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{
              backgroundColor: "rgba(0,0,0,0.1)",
              width: "300px",
              display: "inline-flex",
              alignItems: "center",
              padding: "5px",
              borderRadius: "4px",
              cursor: "pointer",
              color: "black",
            }}>
              <span
                onClick={() => handleExpandFolder(child)} // Handle folder expand/collapse
                style={{ width: "150px" }}
                onDoubleClick={(e) => { e.stopPropagation(); setRenameInput(child), setNewName(child) }}
              >
                📁 {
                  renameInput === child ? <input type='text' ref={renameRef} value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={() => { handleRename(child) }} style={{ width: "100px", padding: 4, borderRadius: 4, }} /> : child
                }
              </span>
              <button onClick={() => handleDelete(child)}>❌</button>
              <button style={{ marginLeft: "auto" }} onClick={() => handleCreateFolder(child)}>Folder + </button>
              <button onClick={() => handleCreateFile(child)}>File + </button>
            </div>

            {createFolder === child && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "5px",
                borderRadius: "4px",
                paddingLeft: "20px"
              }}>
                📁 <input
                  ref={inputRef} // Auto-focus input when rendered
                  type='text'
                  placeholder='Enter Folder Name...'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={(e) => handleAddFolder(e, child, parent)} // Trigger folder creation on blur
                />
              </div>
            )}
            {createFile === child && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "5px",
                borderRadius: "4px",
                paddingLeft: "20px"
              }}>
                📄 <input
                  ref={inputRef} // Auto-focus input when rendered
                  type='text'
                  placeholder='Enter File Name...'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={(e) => handleAddFolder(e, child, parent, true)} // Trigger file creation on blur
                />
              </div>
            )}

            {expanded && (
              <div
                style={{
                  paddingLeft: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {generateFolders(childData.children, createFolder, createFile, expandedFolders, handleExpandFolder, handleCreateFolder, handleCreateFile, name, setName, handleAddFolder, inputRef, handleDelete, renameInput, setRenameInput, newName, setNewName, handleRename, renameRef)}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <span
              style={{
                backgroundColor: "rgba(0,0,0,0.05)",
                width: "300px",
                display: "inline-flex",
                alignItems: "center",
                padding: "5px",
                borderRadius: "4px",
                color: "black",
              }}

              onDoubleClick={(e) => { e.stopPropagation(); setRenameInput(child), setNewName(child) }}
            >

              📄 {
                renameInput === child ? <input type='text' ref={renameRef} value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={() => { handleRename(child) }} style={{ width: "100px", padding: 4, borderRadius: 4, }} /> : child
              }
              <button style={{ marginLeft: "auto" }} onClick={() => handleDelete(child)}>❌</button>
            </span>
          </div>
        )}
      </div>
    );
  });
};


const App = () => {
  const [expandedFolders, setExpandedFolders] = useState([]);
  const [createFolder, setCreateFolder] = useState(null);
  const [createFile, setCreateFile] = useState(null);
  const [name, setName] = useState("");
  const [explorer, setExplorer] = useState(initialExplorer);
  const [renameInput, setRenameInput] = useState(null)
  const [newName, setNewName] = useState("")

  // useRef to focus on input
  const inputRef = useRef(null);
  const renameRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // Auto-focus input when it renders
    }
  }, [createFolder, createFile]); // Trigger focus when either is created

  useEffect(() => {

    if (renameRef.current) {
      renameRef.current.focus()
    }


  }, [renameInput])

  const handleExpandFolder = (folder) => {
    if (expandedFolders.includes(folder)) {
      setExpandedFolders((prev) => prev.filter((f) => f !== folder));
    } else {
      setExpandedFolders((prev) => [...prev, folder]);
    }
  };

  const handleCreateFolder = (folder) => {
    if (!expandedFolders.includes(folder)) {
      setExpandedFolders((prev) => [...prev, folder]);
    }
    setCreateFile(null);
    setName("")
    setCreateFolder(createFolder === folder ? null : folder);
  };

  const handleCreateFile = (folder) => {
    if (!expandedFolders.includes(folder)) {
      setExpandedFolders((prev) => [...prev, folder]);
    }
    setCreateFolder(null);
    setName("")
    setCreateFile(createFile === folder ? null : folder);
  };

  const handleAddFolder = (e, folderName, parent, isFile = false) => {
    if (folderName.trim() === "") return;
    const updatedExplorer = { ...explorer };

    const addEntity = (currentFolder, targetFolder) => {
      if (currentFolder[targetFolder]) {
        const newEntity = isFile ? { type: "File" } : { type: "Folder", children: {} };
        currentFolder[targetFolder].children[name] = newEntity;
      } else {
        Object.keys(currentFolder).forEach((key) => {
          if (currentFolder[key].type === "Folder") {
            addEntity(currentFolder[key].children, targetFolder);
          }
        });
      }
    };

    addEntity(updatedExplorer, folderName);
    setExplorer(updatedExplorer);
    setName("");
    setCreateFolder(null);
    setCreateFile(null);
  };

  const handleDelete = (folderName) => {
    const deleteEntity = (currentFolder, targetFolder) => {
      // Check if the current folder contains the target folder
      if (currentFolder[targetFolder]) {
        delete currentFolder[targetFolder]; // Delete the target folder
        return true; // Found and deleted
      }

      // If not found, recursively search through children
      for (const key in currentFolder) {
        if (currentFolder[key].type === "Folder" && deleteEntity(currentFolder[key].children, targetFolder)) {
          // If found in any child folder, return true to stop further recursion
          return true;
        }
      }

      return false; // Not found
    };

    // Make a copy of the explorer state to avoid direct mutation
    const updatedExplorer = { ...explorer };
    deleteEntity(updatedExplorer, folderName);
    setExplorer(updatedExplorer);
  };



  const handleRename = (folderName) => {
    console.log("rename")
    if (newName === folderName) {
      return setRenameInput(null)
    }

    const renameEntity = (currentFolder, targetFolder) => {

      if (currentFolder[targetFolder]) {
        currentFolder[newName] = currentFolder[targetFolder]
        delete currentFolder[targetFolder];
        return true;
      }
      for (const key in currentFolder) {
        if (currentFolder[key].type === "Folder" && renameEntity(currentFolder[key].children, targetFolder)) {
          // If found in any child folder, return true to stop further recursion
          return true;
        }
      }

      return false;



    }

    const updatedExplorer = { ...explorer };
    renameEntity(updatedExplorer, folderName);
    setExplorer(updatedExplorer);


  }



  return (
    <div style={{ padding: "10px" }}>
      <h2>Double Click to Rename</h2>
      {generateFolders(explorer, createFolder, createFile, expandedFolders, handleExpandFolder, handleCreateFolder, handleCreateFile, name, setName, handleAddFolder, inputRef, handleDelete, renameInput, setRenameInput, newName, setNewName, handleRename, renameRef)}
    </div>
  );
};

export default App;

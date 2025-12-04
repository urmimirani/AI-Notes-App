import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Pin, Lock, Unlock, Trash2, X, Tag, Clock, Globe, BookOpen, Lightbulb, CheckCircle, ChevronDown, ChevronUp, Moon, Sun, Share2, Download, Menu, Sparkles, Copy } from 'lucide-react';

// Firebase imports - you'll need to create firebase.js
import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, setDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

// Encryption utilities
const encryptNote = (text, password) => {
  const encrypted = btoa(unescape(encodeURIComponent(JSON.stringify({ text, key: password }))));
  return encrypted;
};

const decryptNote = (encrypted, password) => {
  try {
    const decrypted = JSON.parse(decodeURIComponent(escape(atob(encrypted))));
    if (decrypted.key === password) {
      return decrypted.text;
    }
    return null;
  } catch {
    return null;
  }
};
// Rich Text Editor Component
const RichTextEditor = ({ content, onChange, onShare, onDownload, onEncrypt, darkMode, isEncrypted }) => {
  const editorRef = useRef(null);

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || '';
    onChange(html);
  };

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-gray-300'} border-b p-3 flex flex-wrap gap-2 items-center transition-all duration-300`}>
        <button onClick={() => applyFormat('bold')} className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105`} title="Bold">
          <strong>B</strong>
        </button>
        <button onClick={() => applyFormat('italic')} className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105`} title="Italic">
          <em>I</em>
        </button>
        <button onClick={() => applyFormat('underline')} className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105`} title="Underline">
          <u>U</u>
        </button>
        <div className={`w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        <button onClick={() => applyFormat('justifyLeft')} className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105`} title="Align Left">
          ≡
        </button>
        <button onClick={() => applyFormat('justifyCenter')} className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105`} title="Align Center">
          ≡
        </button>
        <button onClick={() => applyFormat('justifyRight')} className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105`} title="Align Right">
          ≡
        </button>
        <div className={`w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        <select onChange={(e) => applyFormat('fontSize', e.target.value)} className={`px-3 py-2 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} border rounded-lg shadow-sm hover:shadow-md transition-all duration-200`} defaultValue="3">
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>
        <div className="flex-1"></div>
        <div className="flex gap-2 items-center">
          <button 
            onClick={onShare} 
            className={`px-3 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 relative group`} 
            title="Share"
          >
            <span className="text-lg">🔗</span>
            <span className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'} text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200`}>
              Share
            </span>
          </button>
          <button 
            onClick={onDownload} 
            className={`px-3 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 relative group`} 
            title="Download"
          >
            <span className="text-lg">⬇️</span>
            <span className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'} text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200`}>
              Download
            </span>
          </button>
          <button 
            onClick={onEncrypt} 
            className={`px-3 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 relative group`} 
            title={isEncrypted ? "Decrypt" : "Encrypt"}
          >
            <span className="text-lg">{isEncrypted ? "🔓" : "🔒"}</span>
            <span className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'} text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200`}>
              {isEncrypted ? "Decrypt" : "Encrypt"}
            </span>
          </button>
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className={`flex-1 p-6 overflow-auto focus:outline-none ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} transition-colors duration-300`}
        style={{ minHeight: '300px' }}
      />
    </div>
  );
};

// Main App Component with Firebase Integration
const NotesApp = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiTags, setAiTags] = useState([]);
  const [glossaryTerms, setGlossaryTerms] = useState([]);
  const [passwordPrompt, setPasswordPrompt] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [translateLang, setTranslateLang] = useState('en');
  const [translatedText, setTranslatedText] = useState('');
  const [showVersions, setShowVersions] = useState(false);
  const [grammarErrors, setGrammarErrors] = useState([]);
  const [aiInsights, setAiInsights] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [shareModal, setShareModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [firebaseEnabled, setFirebaseEnabled] = useState(false);
  const unsubscribeRef = useRef(null);
  const versionDebounceRef = useRef(null);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode) {
      setDarkMode(JSON.parse(storedDarkMode));
    }
    
    // Check if Firebase is available
    checkFirebaseAvailability();

    // Cleanup function to unsubscribe from Firebase listener and clear debounce
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (versionDebounceRef.current) {
        clearTimeout(versionDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Check if Firebase is configured
  const checkFirebaseAvailability = async () => {
    try {
      if (db) {
        setFirebaseEnabled(true);
        loadNotesFromFirebase();
      } else {
        loadNotesFromLocalStorage();
      }
    } catch (error) {
      console.log('Firebase not configured, using localStorage');
      loadNotesFromLocalStorage();
    }
  };

  // Load from localStorage (fallback)
  const loadNotesFromLocalStorage = () => {
    const stored = localStorage.getItem('notes');
    if (stored) {
      setNotes(JSON.parse(stored));
    }
  };

  // Save to localStorage (fallback)
  useEffect(() => {
    if (!firebaseEnabled && notes.length > 0) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes, firebaseEnabled]);

  // Firebase real-time listener
  const loadNotesFromFirebase = async () => {
    // Clean up any existing listener first
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      const notesRef = collection(db, 'notes');
      const q = query(notesRef, orderBy('updatedAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedNotes = [];
        snapshot.forEach((doc) => {
          loadedNotes.push({ id: doc.id, ...doc.data() });
        });
        setNotes(loadedNotes);
        // Update currentNote if it's still open
        setCurrentNote(prev => {
          if (prev) {
            const updated = loadedNotes.find(n => n.id === prev.id);
            return updated || prev;
          }
          return prev;
        });
      }, (error) => {
        console.error('Firebase snapshot error:', error);
        setFirebaseEnabled(false);
        loadNotesFromLocalStorage();
      });

      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error('Error loading from Firebase:', error);
      setFirebaseEnabled(false);
      loadNotesFromLocalStorage();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const createNote = async () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      plainText: '',
      pinned: false,
      encrypted: false,
      encryptedContent: null,
      tags: [],
      versions: [],
      sharedWith: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    if (firebaseEnabled) {
      // Firebase version - let the listener handle state updates
      try {
        // Remove id from newNote since Firebase will generate it
        const { id, ...noteData } = newNote;
        const docRef = await addDoc(collection(db, 'notes'), noteData);
        // Set current note immediately for better UX, but don't update notes array
        // The Firebase listener will update it automatically
        const noteWithId = { id: docRef.id, ...noteData };
        setCurrentNote(noteWithId);
        setShowAIPanel(false);
      } catch (error) {
        console.error('Error creating note:', error);
        // Fallback to localStorage
        setFirebaseEnabled(false);
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        setNotes([newNote, ...notes]);
        setCurrentNote(newNote);
        setShowAIPanel(false);
        alert('Firebase error, using local storage');
      }
    } else {
      // localStorage version
      setNotes([newNote, ...notes]);
      setCurrentNote(newNote);
      setShowAIPanel(false);
    }
  };

  const updateNote = async (updates, noteToUpdate = null) => {
    // Use provided note or fall back to currentNote
    const baseNote = noteToUpdate || currentNote;
    if (!baseNote) return;
    
    const updatedNote = {
      ...baseNote,
      ...updates,
      updatedAt: Date.now()
    };

    // Save version history when content changes (but not when restoring a version)
    // Use debouncing to avoid creating versions on every keystroke
    if (updates.content && updates.content !== baseNote.content && !updates._skipVersion) {
      // Save the previous content that we want to store as a version
      const contentToSaveAsVersion = baseNote.content;
      
      // Clear any existing debounce timer
      if (versionDebounceRef.current) {
        clearTimeout(versionDebounceRef.current);
      }
      
      // Debounce version creation - only create version after 3 seconds of no changes
      versionDebounceRef.current = setTimeout(() => {
        // Get current note state to ensure we're saving the right version
        setCurrentNote(prevNote => {
          if (!prevNote || prevNote.id !== baseNote.id) return prevNote;
          
          // Only save version if we have content to save
          if (!contentToSaveAsVersion) return prevNote;
          
          const newVersion = {
            content: contentToSaveAsVersion,
            timestamp: Date.now()
          };
          const existingVersions = prevNote.versions || [];
          const updatedVersions = [...existingVersions, newVersion].slice(-20);
          
          // Update note with new version history
          const noteWithVersion = {
            ...prevNote,
            versions: updatedVersions
          };
          
          // Update notes array
          setNotes(prevNotes => {
            const updatedNotes = prevNotes.map(n => n.id === noteWithVersion.id ? noteWithVersion : n);
            
            // Sync to Firebase/localStorage
            if (firebaseEnabled) {
              const noteRef = doc(db, 'notes', prevNote.id);
              const { id, ...noteData } = noteWithVersion;
              setDoc(noteRef, noteData, { merge: true }).catch(err => {
                console.error('Error saving version history:', err);
              });
            } else {
              localStorage.setItem('notes', JSON.stringify(updatedNotes));
            }
            
            return updatedNotes;
          });
          
          return noteWithVersion;
        });
      }, 3000); // 3 second debounce - create version after user stops typing for 3 seconds
    }

    // Optimistic update - update local state immediately for responsive UI
    setCurrentNote(updatedNote);
    const updatedNotes = notes.map(n => n.id === updatedNote.id ? updatedNote : n);
    setNotes(updatedNotes);

    if (firebaseEnabled) {
      // Firebase version - sync in background
      // Use setDoc with merge to create if doesn't exist, update if it does
      try {
        const noteRef = doc(db, 'notes', baseNote.id);
        // Remove the id from the data before saving (Firestore uses doc.id)
        const { id, ...noteData } = updatedNote;
        await setDoc(noteRef, noteData, { merge: true });
      } catch (error) {
        console.error('Error updating note in Firebase:', error);
        // Only disable Firebase for critical errors, not missing documents
        // Missing documents will be created on next update
        if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
          setFirebaseEnabled(false);
          localStorage.setItem('notes', JSON.stringify(updatedNotes));
          console.warn('Firebase permission error, switching to localStorage');
        } else {
          // For other errors, just log but keep Firebase enabled
          console.warn('Firebase update error (non-critical):', error.message);
        }
      }
    } else {
      // localStorage version
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
    }
  };

  const deleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      // Optimistic update - remove from UI immediately
      const updatedNotes = notes.filter(n => n.id !== id);
      setNotes(updatedNotes);
      if (currentNote?.id === id) {
        setCurrentNote(null);
      }

      if (firebaseEnabled) {
        // Firebase version - sync in background
        try {
          await deleteDoc(doc(db, 'notes', id));
        } catch (error) {
          console.error('Error deleting note:', error);
          setFirebaseEnabled(false);
          localStorage.setItem('notes', JSON.stringify(updatedNotes));
          alert('Firebase error, using local storage');
        }
      } else {
        // localStorage version
        localStorage.setItem('notes', JSON.stringify(updatedNotes));
      }
    }
  };

  const togglePin = async (id) => {
    const note = notes.find(n => n.id === id);
    if (note) {
        // Optimistic update
        const updatedNotes = notes.map(n => n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n);
        setNotes(updatedNotes);
        if (currentNote?.id === id) {
          setCurrentNote({ ...currentNote, pinned: !currentNote.pinned, updatedAt: Date.now() });
        }

        if (firebaseEnabled) {
          // Firebase version - sync in background
          try {
            const noteRef = doc(db, 'notes', id);
            await setDoc(noteRef, { pinned: !note.pinned, updatedAt: Date.now() }, { merge: true });
          } catch (error) {
            console.error('Error toggling pin:', error);
            if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
              setFirebaseEnabled(false);
              localStorage.setItem('notes', JSON.stringify(updatedNotes));
            }
          }
        } else {
          // localStorage version
          localStorage.setItem('notes', JSON.stringify(updatedNotes));
        }
    }
  };

  const encryptCurrentNote = () => {
    // Use note from passwordPrompt if available, otherwise use currentNote
    const noteToEncrypt = passwordPrompt?.note || currentNote;
    if (!noteToEncrypt || !passwordInput.trim()) return;
    
    // Get the most up-to-date note from the notes array
    const latestNote = notes.find(n => n.id === noteToEncrypt.id) || noteToEncrypt;
    
    if (!latestNote.content) {
      alert('Note is empty!');
      return;
    }
    
    const encrypted = encryptNote(latestNote.content, passwordInput);
    
    // Update the note, passing the latestNote directly
    updateNote({
      encrypted: true,
      encryptedContent: encrypted,
      content: ''
    }, latestNote);
    
    setPasswordPrompt(null);
    setPasswordInput('');
  };

  const decryptCurrentNote = async () => {
    // Use note from passwordPrompt if available, otherwise use currentNote
    const noteToDecrypt = passwordPrompt?.note || currentNote;
    if (!noteToDecrypt || !passwordInput.trim()) {
      alert('Please enter a password');
      return;
    }
    
    // Get the most up-to-date note from the notes array to ensure we have encryptedContent
    // This is important after refresh or when switching notes
    const latestNote = notes.find(n => n.id === noteToDecrypt.id);
    
    if (!latestNote) {
      alert('Note not found!');
      setPasswordPrompt(null);
      setPasswordInput('');
      return;
    }
    
    if (!latestNote.encrypted || !latestNote.encryptedContent) {
      alert('This note is not encrypted or encrypted content is missing!');
      setPasswordPrompt(null);
      setPasswordInput('');
      return;
    }
    
    // Try to decrypt
    const decrypted = decryptNote(latestNote.encryptedContent, passwordInput);
    
    if (decrypted !== null && decrypted !== undefined) {
      // Update the note with decrypted content, passing the latestNote directly
      updateNote({
        encrypted: false,
        content: decrypted,
        encryptedContent: null
      }, latestNote);
      
      // Set current note to show the decrypted content
      setCurrentNote({
        ...latestNote,
        encrypted: false,
        content: decrypted,
        encryptedContent: null
      });
      
      setPasswordPrompt(null);
      setPasswordInput('');
    } else {
      alert('Incorrect password!');
      setPasswordInput(''); // Clear password input on error
    }
  };

  const callAI = async (prompt, systemPrompt = '', options = {}) => {
    setLoading(true);
    try {
      const apiKey = process.env.REACT_APP_GROQ_API_KEY;
      
      if (!apiKey) {
        setLoading(false);
        return 'AI service unavailable: API key not configured. Please set REACT_APP_GROQ_API_KEY in your .env file.';
      }

      // Build messages array - Groq supports system messages
      const messages = [];
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt
        });
      }
      messages.push({
        role: 'user',
        content: prompt
      });

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct', // Current Groq model. Alternatives: 'meta-llama/llama-4-maverick-17b-128e-instruct'
          messages: messages,
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AI API Error:', response.status, errorData);
        setLoading(false);
        return `AI service unavailable: ${errorData.error?.message || `HTTP ${response.status}`}`;
      }

      const data = await response.json();
      setLoading(false);
      
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content;
      } else {
        console.error('Unexpected API response format:', data);
        return 'AI service unavailable: Unexpected response format';
      }
    } catch (error) {
      console.error('AI Error:', error);
      setLoading(false);
      return `AI service unavailable: ${error.message || 'Network error'}`;
    }
  };

  const generateSummary = async () => {
    if (!currentNote) return;
    const plainText = currentNote.plainText || currentNote.content.replace(/<[^>]*>/g, '');
    const summary = await callAI(
      `Summarize this note in 1-2 concise sentences:\n\n${plainText}`,
      'You are a helpful assistant that creates brief, informative summaries.'
    );
    setAiSummary(summary);
  };

  const generateTags = async () => {
    if (!currentNote) return;
    const plainText = currentNote.plainText || currentNote.content.replace(/<[^>]*>/g, '');
    const tagsText = await callAI(
      `Suggest 3-5 relevant tags for this note. Return only the tags as a comma-separated list:\n\n${plainText}`,
      'You are a helpful assistant that suggests relevant tags.'
    );
    const tags = tagsText.split(',').map(t => t.trim()).filter(t => t);
    setAiTags(tags);
    updateNote({ tags });
  };

  const identifyGlossaryTerms = async () => {
    if (!currentNote) {
      alert('Please select a note first');
      return;
    }
    
    const plainText = currentNote.plainText || currentNote.content.replace(/<[^>]*>/g, '').trim();
    
    if (!plainText || plainText.length === 0) {
      alert('Note is empty. Please add some content first.');
      setGlossaryTerms([]);
      return;
    }
    
    // Clear previous results
    setGlossaryTerms([]);
    setLoading(true);
    
    try {
      // Handle large text by chunking if needed
      const maxLength = 12000; // Increased for better processing
      let textToProcess = plainText;
      let isTruncated = false;
      
      if (plainText.length > maxLength) {
        // For large text, take first part and mention truncation
        textToProcess = plainText.substring(0, maxLength);
        isTruncated = true;
      }
      
      // Create a more specific prompt for better results
      const prompt = `Analyze the following text and identify 5-8 key terms or important concepts. For each term, provide:
1. The term name
2. A brief, clear definition (1-2 sentences)

${isTruncated ? '[Note: This is a long document. Analyzing the first portion. Key terms from the beginning are shown.]\n\n' : ''}Text to analyze:\n\n${textToProcess}

IMPORTANT: Return ONLY a valid JSON array in this exact format:
[
  {"term": "Term Name", "definition": "Definition here"},
  {"term": "Another Term", "definition": "Another definition"}
]

Do not include any markdown formatting, code blocks, or explanatory text. Only return the JSON array.`;
      
      const termsText = await callAI(
        prompt,
        'You are a helpful assistant that identifies key terms. You MUST respond with ONLY a valid JSON array, no other text.',
        { maxTokens: 2000, temperature: 0.5 } // More tokens for better results, lower temperature for more consistent JSON
      );
      
      if (!termsText || termsText.includes('AI service unavailable')) {
        alert('Unable to identify key terms. Please check your API configuration or try again.');
        setLoading(false);
        return;
      }
      
      // Try to extract JSON from the response
      let cleaned = termsText.trim();
      
      // Remove markdown code blocks if present
      cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      // Try to find JSON array in the response
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
      
      try {
        const terms = JSON.parse(cleaned);
        
        // Validate the structure
        if (Array.isArray(terms) && terms.length > 0) {
          // Ensure all items have required fields
          const validTerms = terms
            .filter(t => t && (t.term || t.name) && (t.definition || t.description))
            .map(t => ({
              term: t.term || t.name || 'Unknown',
              definition: t.definition || t.description || 'No definition provided'
            }))
            .slice(0, 10); // Limit to 10 terms
          
          if (validTerms.length > 0) {
            setGlossaryTerms(validTerms);
          } else {
            alert('No valid key terms found in the response.');
          }
        } else {
          throw new Error('Response is not a valid array');
        }
      } catch (parseError) {
        console.error('Failed to parse glossary terms:', parseError);
        console.error('Response text:', termsText);
        
        // Enhanced fallback parsing
        const lines = termsText.split('\n').filter(line => line.trim());
        const fallbackTerms = [];
        
        for (const line of lines) {
          // Try to match patterns like "Term: Definition" or "Term - Definition"
          const colonMatch = line.match(/^(.+?):\s*(.+)$/);
          const dashMatch = line.match(/^(.+?)\s*-\s*(.+)$/);
          
          if (colonMatch) {
            fallbackTerms.push({
              term: colonMatch[1].trim(),
              definition: colonMatch[2].trim()
            });
          } else if (dashMatch) {
            fallbackTerms.push({
              term: dashMatch[1].trim(),
              definition: dashMatch[2].trim()
            });
          }
          
          if (fallbackTerms.length >= 8) break;
        }
        
        if (fallbackTerms.length > 0) {
          setGlossaryTerms(fallbackTerms);
          alert('Key terms identified, but the format may not be perfect. Please check the results.');
        } else {
          alert('Unable to parse key terms from the response. The AI may have returned an unexpected format. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error identifying glossary terms:', error);
      alert('An error occurred while identifying key terms. Please try again.');
      setGlossaryTerms([]);
    } finally {
      setLoading(false);
    }
  };

  const checkGrammar = async () => {
    if (!currentNote) return;
    const plainText = currentNote.plainText || currentNote.content.replace(/<[^>]*>/g, '');
    const errors = await callAI(
      `Identify grammatical errors in this text. Return as JSON array with {error, suggestion}. If no errors, return empty array:\n\n${plainText}`,
      'You are a grammar checking assistant. Always respond with valid JSON only.'
    );
    
    try {
      const cleaned = errors.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const errorList = JSON.parse(cleaned);
      setGrammarErrors(errorList);
      if (errorList.length === 0) {
        alert('No grammar errors found! Your text is grammatically correct.');
      }
    } catch (e) {
      console.error('Failed to parse grammar errors:', e);
    }
  };

  const translateNote = async () => {
    if (!currentNote) return;
    const plainText = currentNote.plainText || currentNote.content.replace(/<[^>]*>/g, '');
    const langNames = { en: 'English', hi: 'Hindi', es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese', zh: 'Chinese' };
    const translated = await callAI(
      `Translate this text to ${langNames[translateLang]}:\n\n${plainText}`,
      'You are a translation assistant. Provide only the translation.'
    );
    setTranslatedText(translated);
  };

  const generateInsights = async () => {
    if (!currentNote) return;
    const plainText = currentNote.plainText || currentNote.content.replace(/<[^>]*>/g, '');
    const insights = await callAI(
      `Analyze this note and provide insights: key themes, recommendations, and related topics:\n\n${plainText}`,
      'You are an intelligent assistant that provides deep insights.'
    );
    setAiInsights(insights);
  };

  const restoreVersion = (version) => {
    if (window.confirm('Restore this version?')) {
      // Skip version history when restoring to avoid creating a new version from the restore
      updateNote({ content: version.content, _skipVersion: true });
      setShowVersions(false);
    }
  };

  const shareNote = async () => {
    if (!currentNote) return;
    
      if (firebaseEnabled) {
        // Firebase version
        try {
          const shareData = {
            noteId: currentNote.id,
            title: currentNote.title,
            content: currentNote.content,
            sharedAt: Date.now()
          };
          await addDoc(collection(db, 'shared'), shareData);
          const shareUrl = `${window.location.origin}?shared=${currentNote.id}`;
          setShareModal({ url: shareUrl, noteId: currentNote.id });
        } catch (error) {
          console.error('Error sharing note:', error);
          // Fallback to simple URL sharing
          const shareUrl = `${window.location.origin}?note=${currentNote.id}`;
          setShareModal({ url: shareUrl, noteId: currentNote.id });
        }
      } else {
        // localStorage version - just show the URL
        const shareUrl = `${window.location.origin}?note=${currentNote.id}`;
        setShareModal({ url: shareUrl, noteId: currentNote.id });
      }
  };

  const downloadNote = () => {
    if (!currentNote) return;
    const plainText = currentNote.plainText || currentNote.content.replace(/<[^>]*>/g, '');
    const blob = new Blob([`${currentNote.title}\n\n${plainText}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentNote.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredNotes = notes
    .filter(n => {
      const search = searchTerm.toLowerCase();
      const plainText = n.plainText || n.content.replace(/<[^>]*>/g, '');
      return n.title.toLowerCase().includes(search) || plainText.toLowerCase().includes(search);
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

  const handleContentChange = (html) => {
    const plainText = html.replace(/<[^>]*>/g, '');
    updateNote({ content: html, plainText });
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-all duration-500`}>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out; }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* Firebase Status Indicator */}
      {!firebaseEnabled && (
        <div className="fixed top-4 right-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            Using Local Storage
          </span>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col transition-all duration-300 overflow-hidden shadow-xl`}>
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>AI Notes</h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Smart note-taking</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all duration-200 transform hover:scale-110`}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
          
          <div className="relative mb-3">
            <Search className={`absolute left-3 top-3 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-3 py-2.5 ${darkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-500' : 'bg-gray-50 border-gray-200'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200`}
            />
          </div>
          
          <button
            onClick={createNote}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg hover:shadow-md flex items-center justify-center gap-2 transition-all duration-200 font-medium"
          >
            <Plus className="w-5 h-5" /> New Note
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredNotes.map((note, index) => (
            <div
              key={note.id}
              onClick={() => {
                if (note.encrypted) {
                  // Set currentNote first so decrypt function has context
                  setCurrentNote(note);
                  setPasswordPrompt({ type: 'decrypt', note });
                } else {
                  setCurrentNote(note);
                  setShowAIPanel(false);
                }
              }}
              className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} cursor-pointer hover:shadow-md transition-all duration-200 animate-fade-in-up ${
                currentNote?.id === note.id ? (darkMode ? 'bg-gray-700 border-l-4 border-l-purple-500' : 'bg-purple-50 border-l-4 border-l-purple-500') : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {note.pinned && <Pin className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                    {note.encrypted && <Lock className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>{note.title}</h3>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate mb-2`}>
                    {note.plainText || note.content.replace(/<[^>]*>/g, '') || 'Empty note'}
                  </p>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className={`text-xs ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-purple-100 text-purple-700'} px-2 py-0.5 rounded-full`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                    className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-purple-100'} transition-all duration-200 transform hover:scale-110`}
                  >
                    <Pin className={`w-4 h-4 ${note.pinned ? 'text-purple-500' : (darkMode ? 'text-gray-500' : 'text-gray-400')}`} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-red-100'} transition-all duration-200 transform hover:scale-110`}
                  >
                    <Trash2 className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'} hover:text-red-500`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <BookOpen className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`} />
              <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No notes found</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed bottom-4 left-4 p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-full shadow-lg z-50 lg:hidden transform hover:scale-110 transition-all duration-200`}
      >
        <Menu className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-800'}`} />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentNote ? (
          <>
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-lg border-gray-200'} border-b p-4 flex items-center justify-between shadow-sm flex-wrap gap-2`}>
              <input
                type="text"
                value={currentNote.title}
                onChange={(e) => updateNote({ title: e.target.value })}
                className={`text-2xl font-bold ${darkMode ? 'text-white bg-gray-800' : 'text-gray-800 bg-transparent'} border-none focus:outline-none flex-1 min-w-0`}
              />
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-sm hover:shadow-md flex items-center gap-2 transition-all duration-200 font-medium text-sm"
                >
                  <Sparkles className="w-4 h-4" /> AI Tools
                </button>
              </div>
            </div>

            {currentNote.encrypted ? (
              <div className={`flex-1 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
                <div className="text-center animate-fade-in-up">
                  <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Note is Encrypted</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>This note is password protected</p>
                  <button
                    onClick={() => setPasswordPrompt({ type: 'decrypt', note: currentNote })}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-md transition-all duration-200"
                  >
                    Unlock Note
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                <RichTextEditor
                  content={currentNote.content}
                  onChange={handleContentChange}
                  onShare={shareNote}
                  onDownload={downloadNote}
                  onEncrypt={() => setPasswordPrompt({ type: currentNote.encrypted ? 'decrypt' : 'encrypt', note: currentNote })}
                  darkMode={darkMode}
                  isEncrypted={currentNote.encrypted}
                />
              </div>
            )}
          </>
        ) : (
          <div className={`flex-1 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="text-center animate-fade-in-up">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
              <h3 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Welcome to AI Notes</h3>
              <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Select a note or create a new one to get started</p>
              <button
                onClick={createNote}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-md transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" /> Create Your First Note
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Panel */}
      {showAIPanel && currentNote && !currentNote.encrypted && (
        <div className={`w-96 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-l overflow-auto p-6 shadow-2xl animate-fade-in`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>AI Assistant</h2>
            </div>
            <button onClick={() => setShowAIPanel(false)} className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-all duration-200`}>
              <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>

          {loading && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shimmer">
              <p className="text-white text-center font-medium">AI is thinking...</p>
            </div>
          )}

          {/* Summary */}
          <div className="mb-6">
            <button
              onClick={generateSummary}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Generate Summary
            </button>
            {aiSummary && (
              <div className={`mt-3 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded-xl animate-fade-in`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{aiSummary}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mb-6">
          <button
            onClick={generateTags}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Tag className="w-4 h-4" /> Suggest Tags
          </button>
            {aiTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
                {aiTags.map((tag, i) => (
                  <span key={i} className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Grammar */}
          <div className="mb-6">
            <button
              onClick={checkGrammar}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Check Grammar
            </button>
            {grammarErrors.length > 0 && (
              <div className="mt-3 space-y-2 animate-fade-in">
                {grammarErrors.map((err, i) => (
                  <div key={i} className={`${darkMode ? 'bg-gray-700 border-red-500' : 'bg-red-50 border-red-200'} border-l-4 p-3 rounded-lg shadow-sm`}>
                    <p className={`${darkMode ? 'text-red-400' : 'text-red-700'} font-semibold text-sm mb-1`}>{err.error}</p>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                      <span className="font-medium">Suggestion:</span> {err.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Glossary */}
          <div className="mb-6">
            <button
              onClick={identifyGlossaryTerms}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Identify Key Terms
            </button>
            {glossaryTerms.length > 0 && (
              <div className="mt-3 space-y-2 animate-fade-in">
                {glossaryTerms.map((term, i) => (
                  <div key={i} className={`${darkMode ? 'bg-gray-700' : 'bg-purple-50'} p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200`}>
                    <p className={`font-semibold text-sm ${darkMode ? 'text-purple-400' : 'text-purple-700'} mb-1`}>{term.term}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{term.definition}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Translation */}
          <div className="mb-6">
            <select
              value={translateLang}
              onChange={(e) => setTranslateLang(e.target.value)}
              className={`w-full mb-3 p-3 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200`}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="zh">Chinese</option>
            </select>
            <button
              onClick={translateNote}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Globe className="w-4 h-4" /> Translate
            </button>
            {translatedText && (
              <div className={`mt-3 ${darkMode ? 'bg-gray-700' : 'bg-orange-50'} p-4 rounded-xl animate-fade-in`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>{translatedText}</p>
              </div>
            )}
          </div>

          {/* Insights */}
          <div className="mb-6">
            <button
              onClick={generateInsights}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lightbulb className="w-4 h-4" /> Generate Insights
            </button>
            {aiInsights && (
              <div className={`mt-3 ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'} p-4 rounded-xl animate-fade-in`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>{aiInsights}</p>
              </div>
            )}
          </div>


          {/* Version History */}
          <div className="mb-6">
            <button
              onClick={() => setShowVersions(!showVersions)}
              className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-700'} text-white py-3 rounded-lg font-medium hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2`}
            >
              <Clock className="w-4 h-4" /> Version History
              {showVersions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showVersions && (
              <div className="mt-3 space-y-2 max-h-60 overflow-auto animate-fade-in">
                {currentNote.versions && currentNote.versions.length > 0 ? (
                  [...currentNote.versions].sort((a, b) => b.timestamp - a.timestamp).map((ver, i) => (
                    <div key={i} className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} p-3 rounded-xl shadow-sm transition-all duration-200`}>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mb-2 flex items-center gap-1.5`}>
                        <Clock className="w-3 h-3" />
                        {new Date(ver.timestamp).toLocaleString()}
                      </p>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm truncate mb-2`}>
                        {ver.content ? ver.content.replace(/<[^>]*>/g, '').substring(0, 50) : 'Empty version'}...
                      </p>
                      <button
                        onClick={() => restoreVersion(ver)}
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium transition-colors"
                      >
                        Restore Version
                      </button>
                    </div>
                  ))
                ) : (
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm text-center py-4`}>
                    No version history available
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-in-up`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                {passwordPrompt.type === 'encrypt' ? <Lock className="w-6 h-6 text-white" /> : <Unlock className="w-6 h-6 text-white" />}
              </div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {passwordPrompt.type === 'encrypt' ? 'Encrypt Note' : 'Decrypt Note'}
              </h3>
            </div>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter password"
              className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 border-gray-300'} border rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  passwordPrompt.type === 'encrypt' ? encryptCurrentNote() : decryptCurrentNote();
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPasswordPrompt(null);
                  setPasswordInput('');
                }}
                className={`flex-1 px-4 py-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-xl font-semibold transition-all duration-200 transform hover:scale-105`}
              >
                Cancel
              </button>
              <button
                onClick={passwordPrompt.type === 'encrypt' ? encryptCurrentNote : decryptCurrentNote}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-md transition-all duration-200"
              >
                {passwordPrompt.type === 'encrypt' ? 'Encrypt' : 'Decrypt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-in-up`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Share Note</h3>
            </div>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Share this link with others:</p>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-xl mb-6`}>
              <code className={`${darkMode ? 'text-green-400' : 'text-green-600'} text-sm break-all`}>{shareModal.url}</code>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareModal.url);
                  alert('Link copied to clipboard successfully.');
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-md transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Link
                </span>
              </button>
              <button
                onClick={() => setShareModal(null)}
                className={`px-4 py-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg font-medium transition-all duration-200`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesApp;
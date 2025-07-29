import { 
  Fab, Box, Typography, TextField, Button, IconButton, 
  List, ListItem, Avatar, Paper, Chip, CircularProgress 
} from "@mui/material";
import { 
  FaRobot, FaTimes, FaPaperPlane, FaLeaf, FaUser, 
  FaShoppingCart, FaHospital, FaQuestionCircle 
} from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const initialSuggestions = [
    "Tell me about Turmeric",
    "What herbs help with stress?",
    "Show me Ashwagandha products",
    "Find hospitals near me",
    "Benefits of Tulsi",
    "Herbs for immunity"
  ];

  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: "Hello! 🌿 I'm HerbBot, your AI-powered herbal medicine assistant. I can help you with:\n\n• Information about herbs and their benefits\n• Product recommendations and prices\n• Hospital locations and details\n• Health conditions and natural remedies\n• Dosage and safety information\n\nWhat would you like to know?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setSuggestions(initialSuggestions);
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);
    setSuggestions([]);

    try {
      const response = await axios.post('http://localhost:5000/api/chatbot/chat', {
        message: messageText
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
        type: response.data.type || 'text'
      };

      setMessages(prev => [...prev, botMessage]);

      generateSuggestions(messageText, response.data.response);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm experiencing some technical difficulties. Please try again or visit our herb catalog and hospital discovery pages for more information.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = (userMessage, botResponse) => {
    const message = userMessage.toLowerCase();
    let newSuggestions = [];

    if (message.includes('turmeric') || botResponse.includes('turmeric')) {
      newSuggestions = [
        "Show me turmeric products",
        "Turmeric dosage information",
        "Other anti-inflammatory herbs"
      ];
    } else if (message.includes('stress') || message.includes('anxiety')) {
      newSuggestions = [
        "Tell me about Ashwagandha",
        "Brahmi for mental health",
        "Meditation and herbs"
      ];
    } else if (message.includes('product') || message.includes('buy')) {
      newSuggestions = [
        "View herb catalog",
        "Compare product prices",
        "Check product quality"
      ];
    } else if (message.includes('hospital') || message.includes('doctor')) {
      newSuggestions = [
        "Find nearby hospitals",
        "Ayurvedic specialists",
        "Hospital ratings"
      ];
    } else if (message.includes('immunity') || message.includes('immune')) {
      newSuggestions = [
        "Tell me about Tulsi",
        "Immunity boosting herbs",
        "Seasonal health tips"
      ];
    } else {
      newSuggestions = [
        "Popular herbs",
        "Health conditions",
        "Product recommendations",
        "Hospital finder"
      ];
    }

    setSuggestions(newSuggestions);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  const getMessageIcon = (sender) => {
    return sender === 'bot' ? (
      <Avatar sx={{ bgcolor: '#3a4d2d', width: 32, height: 32 }}>
        <FaRobot size={16} />
      </Avatar>
    ) : (
      <Avatar sx={{ bgcolor: '#2e7d32', width: 32, height: 32 }}>
        <FaUser size={16} />
      </Avatar>
    );
  };

  const QuickActions = () => (
    <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#3a4d2d' }}>
        Quick Actions:
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          icon={<FaLeaf />}
          label="Herb Info"
          size="small"
          onClick={() => sendMessage("Tell me about popular herbs")}
          sx={{ cursor: 'pointer' }}
        />
        <Chip
          icon={<FaShoppingCart />}
          label="Products"
          size="small"
          onClick={() => sendMessage("Show me available products")}
          sx={{ cursor: 'pointer' }}
        />
        <Chip
          icon={<FaHospital />}
          label="Hospitals"
          size="small"
          onClick={() => sendMessage("Find hospitals near me")}
          sx={{ cursor: 'pointer' }}
        />
        <Chip
          icon={<FaQuestionCircle />}
          label="Help"
          size="small"
          onClick={() => sendMessage("help")}
          sx={{ cursor: 'pointer' }}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      {open && (
        <Paper
          elevation={8}
          sx={{
            position: "absolute",
            bottom: 70,
            right: 0,
            width: { xs: 350, sm: 400 },
            height: 500,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'white'
          }}
        >
          <Box sx={{
            p: 2,
            bgcolor: '#3a4d2d',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: '#2e7d32', mr: 1, width: 32, height: 32 }}>
                <FaRobot size={16} />
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  HerbBot AI
                </Typography>
                <Typography variant="caption">
                  Herbal Medicine Assistant
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <FaTimes />
            </IconButton>
          </Box>

          <Box sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 1,
            bgcolor: '#f8f9fa'
          }}>
            <List sx={{ p: 0 }}>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    px: 1,
                    py: 0.5
                  }}
                >
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    maxWidth: '85%',
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                  }}>
                    <Box sx={{ mx: 1 }}>
                      {getMessageIcon(message.sender)}
                    </Box>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        bgcolor: message.sender === 'user' ? '#3a4d2d' : 'white',
                        color: message.sender === 'user' ? 'white' : 'black',
                        borderRadius: 2,
                        maxWidth: '100%'
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-line',
                          wordBreak: 'break-word'
                        }}
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(message.text)
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.7,
                          fontSize: '0.7rem'
                        }}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Paper>
                  </Box>
                </ListItem>
              ))}
              
              {loading && (
                <ListItem sx={{ justifyContent: 'flex-start', px: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#3a4d2d', mr: 1, width: 32, height: 32 }}>
                      <FaRobot size={16} />
                    </Avatar>
                    <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          HerbBot is thinking...
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                </ListItem>
              )}
            </List>
            <div ref={messagesEndRef} />
          </Box>

          {suggestions.length > 0 && (
            <Box sx={{ p: 1, borderTop: '1px solid #e0e0e0', bgcolor: 'white' }}>
              <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>
                Suggested questions:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {suggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    size="small"
                    variant="outlined"
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      '&:hover': { bgcolor: '#f0f0f0' }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <QuickActions />

          <Box sx={{
            p: 2,
            borderTop: '1px solid #e0e0e0',
            bgcolor: 'white'
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask about herbs, products, or hospitals..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: '#3a4d2d' },
                    '&.Mui-focused fieldset': { borderColor: '#3a4d2d' }
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={() => sendMessage()}
                disabled={loading || !inputMessage.trim()}
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  bgcolor: '#3a4d2d',
                  '&:hover': { bgcolor: '#2d3d22' }
                }}
              >
                <FaPaperPlane />
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      <Fab
        color="primary"
        onClick={() => setOpen(!open)}
        sx={{
          bgcolor: '#3a4d2d',
          '&:hover': { bgcolor: '#2d3d22' },
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        {open ? <FaTimes /> : <FaRobot />}
      </Fab>
    </Box>
  );
}

export default Chatbot;
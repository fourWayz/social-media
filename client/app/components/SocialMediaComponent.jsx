"use client"

import React, { useState, useEffect } from "react";
import { useContract } from "../lib/ContractContext";
import { ethers } from "ethers";
import { utils } from "zksync-ethers";
import { Container, Navbar, Nav, Card, Button, Form, Alert, Row, Col, Spinner } from "react-bootstrap";
import { FaThumbsUp, FaCommentDots } from "react-icons/fa";
import Particles from "react-tsparticles";
import { motion } from "framer-motion";
import {PrivyProvider, usePrivy,useLogin} from '@privy-io/react-auth';

function SocialMediaComponent() {
  const { contract, wallet } = useContract();
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [posts, setPosts] = useState([]);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [commentText, setCommentText] = useState({});

  const PAYMASTER_ADDRESS = require('../variables/paymasterAddress.json');
  const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
    type: "General",
    innerInput: new Uint8Array(),
  });

  const {login} = useLogin({
    onComplete: (user, isNewUser, wasAlreadyAuthenticated, loginMethod, linkedAccount) => {
      console.log(user, isNewUser, wasAlreadyAuthenticated, loginMethod, linkedAccount);
      // Any logic you'd like to execute if the user is/becomes authenticated while this
      // component is mounted
    },
    onError: (error) => {
      console.log(error);
      // Any logic you'd like to execute after a user exits the login flow or there is an error
    },
  });

  useEffect(() => {
    connectToWallet();
  }, []);

  useEffect(() => {
    fetchRegisteredUser();
  }, [wallet]);

  useEffect(() => {
    if (contract) {
      fetchPosts();
    }
  }, [contract]);

  const connectToWallet = async function () {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        setIsLoading(false);
      } else {
        throw new Error('Wallet connection not available.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPosts = async function () {
    try {
      await getPosts();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const fetchRegisteredUser = async function () {
    try {
      if (wallet) {
        const address = await wallet.getAddress();
        const user = await contract.getUserByAddress(address);
        if (user) {
          setRegisteredUser(user);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const registerUser = async () => {
    try {
      setMessage('Registering, please wait!');
      const tx = await contract.registerUser(username);
      await tx.wait();
      setMessage('User registered successfully.');
      setUsername('');
      fetchRegisteredUser();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const createPost = async () => {
    try {
      setMessage('Creating post, please wait!');
      const tx = await contract.createPost(content);
      await tx.wait();
      if (tx.hash) {
        setMessage('Post created successfully!');
        setTimeout(() => {
          setMessage('');
          setContent('');
        }, 3000);
        getPosts();
      } else {
        setMessage('Error creating post');
        setTimeout(() => {
          setMessage('');
        }, 2000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const likePost = async (postId) => {
    try {
      setMessage('Liking post, please wait!');
      const tx = await contract.likePost(postId);
      await tx.wait();
      setMessage('Post liked successfully.');
      await getPosts();
      setTimeout(() => {
        setMessage('');
        setContent('');
      }, 3000);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const addComment = async (postId, comment) => {
    try {
      setMessage('Adding comment, please wait!');
      const tx = await contract.connect(wallet).addComment(postId, comment);
      await tx.wait();
      setMessage('Comment added successfully.');
      getPosts();

      setTimeout(() => {
        setMessage('');
        setContent('');
      }, 3000);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const getPosts = async () => {
    try {
      const count = await contract.getPostsCount();
      const fetchedPosts = [];
      for (let i = 0; i < count; i++) {
        const post = await contract.getPost(i);
        const comments = [];
        for (let j = 0; j < post.commentsCount; j++) {
          const comment = await contract.getComment(i, j);
          comments.push(comment);
        }
        fetchedPosts.push({ ...post, comments });
      }
      setPosts(fetchedPosts);
      setMessage('');
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const handleCommentChange = (postId, text) => {
    setCommentText(prevState => ({ ...prevState, [postId]: text }));
  };

  const handleAddComment = (postId) => {
    const comment = commentText[postId];
    addComment(postId, comment);
    setCommentText(prevState => ({ ...prevState, [postId]: '' }));
  };

  // Particle configuration
  const particlesOptions = {
    background: {
      color: {
        value: "#ffffff",
      },
    },
    fpsLimit: 60,
    interactivity: {
      detectsOn: "canvas",
      events: {
        onClick: {
          enable: true,
          mode: "push",
        },
        onHover: {
          enable: true,
          mode: "repulse",
        },
        resize: true,
      },
      modes: {
        bubble: {
          distance: 400,
          duration: 2,
          opacity: 0.8,
          size: 40,
        },
        push: {
          quantity: 4,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: "#ff0000",
      },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      collisions: {
        enable: true,
      },
      move: {
        direction: "none",
        enable: true,
        outMode: "bounce",
        random: false,
        speed: 6,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          value_area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        random: true,
        value: 5,
      },
    },
    detectRetina: true,
  };

  return (
    <div>
      <Particles
        id="tsparticles"
        options={particlesOptions}
        style={{ position: "absolute", zIndex: -1, width: "100%", height: "100%" }}
      />
      <Container className="mt-5">
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand href="#">Social Media</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                {registeredUser && (
                  <Nav.Item>
                    <Button variant="warning" disabled>
                      {registeredUser.userAddress.slice(0, 6)}...
                    </Button>
                  </Nav.Item>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {!registeredUser && (
          <Row className="mt-3">
            <Col md={6}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                <Card>
                  <Card.Body>
                    <Card.Title>Create Account</Card.Title>
                    <Form.Control
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <Button variant="primary" onClick={registerUser} disabled={isLoading} className="mt-2">
                      {isLoading ? <Spinner animation="border" size="sm" /> : 'Register'}
                    </Button>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        )}

        {registeredUser && (
          <Row className="mt-3">
            <Col md={6}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                <Card>
                  <Card.Body>
                    <Card.Title>Create Post</Card.Title>
                    <Button variant="primary" onClick={login} className="mt-2">
                      Connect Social
                    </Button>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                    <Button variant="primary" onClick={createPost} disabled={isLoading} className="mt-2">
                      {isLoading ? <Spinner animation="border" size="sm" /> : 'Create Post'}
                    </Button>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        )}

        <div className="mt-3">
          {message && <Alert variant="info">{message}</Alert>}
          <h3>Posts</h3>
          <Row>
            {posts.map((post, index) => (
              <Col md={6} key={index}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                  <Card className="shadow p-2 mb-3">
                    <Card.Body>
                      <Card.Title style={{ color: 'darkgrey' }}>Author: {post[0]}</Card.Title>
                      <Card.Text style={{ color: 'darkgrey' }}>{post[1]}</Card.Text>
                      <Card.Text style={{ color: 'darkgrey' }}>Likes: {post[3]?.toString()}</Card.Text>

                      {registeredUser && (
                        <>
                          <Button variant="primary" onClick={() => likePost(index)} className="m-2">
                            <FaThumbsUp /> Like
                          </Button>
                          <Form.Control
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText[index] || ''}
                            onChange={(e) => handleCommentChange(index, e.target.value)}
                            className="m-2"
                          />
                          <Button variant="secondary" onClick={() => handleAddComment(index)}>
                            <FaCommentDots /> Comment
                          </Button>
                        </>
                      )}

                      <div className="mt-3">
                        <h5>Comments</h5>
                        {post.comments.map((comment, commentIndex) => (
                          <p key={commentIndex} className="text-info">
                            {comment.content} <br />
                            <span className="text-primary">
                              {`${comment.commenter.slice(0, 6)}...${comment.commenter.slice(comment.commenter.length - 4)}`}
                            </span>
                          </p>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </div>
  );
}

export default SocialMediaComponent;

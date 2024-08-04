"use client"

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { utils, BrowserProvider, Provider,Wallet } from "zksync-ethers";
import { Container, Navbar, Nav, Card, Button, Form, Alert, Row, Col, Spinner, Modal } from "react-bootstrap";
import { FaThumbsUp, FaCommentDots, FaLink } from "react-icons/fa";
import Particles from "react-tsparticles";
import { motion } from "framer-motion";
import { create } from 'ipfs-http-client';
import { useLogin } from '@privy-io/react-auth';
import {FileUploadFToIPFS} from '../lib/uploadToIpfs'
import Image from "next/image";

const CONTRACT_ABI = require('../variables/abi.json');
const CONTRACT_ADDRESS = require('../variables/address.json');
const PAYMASTER_ADDRESS = require('../variables/paymasterAddress.json');


// const ipfs = create('https://ipfs.infura.io:5001/api/v0');
// console.log(ipfs,'ipfs')

function SocialMediaComponent() {
  const [username, setUsername] = useState('');
  const [account, setAccount] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [posts, setPosts] = useState([]);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [socialAccount, setSocialAccount] = useState({ username: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  const [profileImageURL, setProfileImageURL] = useState('');

  const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
    type: "General",
    innerInput: new Uint8Array(),
  });


  const handleLoginComplete = (user, isNewUser, wasAlreadyAuthenticated, loginMethod, linkedAccount) => {
    const username = linkedAccount?.username || linkedAccount?.name;
    if (username) {
      localStorage.setItem('socialAccount', JSON.stringify({ username, type: linkedAccount.type }));
      setSocialAccount({ username, type: linkedAccount.type });
    }
  };

  const uploadImageToIPFS = async (file) => {
    try {
      const response = await FileUploadFToIPFS(file)
      return response.pinataURL

    } catch (error) {
      console.error('Error uploading file to IPFS: ', error);
      return null;
    }
  };

  const { login } = useLogin({
    onComplete: handleLoginComplete,
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    const storedSocialAccount = JSON.parse(localStorage.getItem('socialAccount'));
    const storedProfileImageURL = localStorage.getItem('profileImageURL');
    if (storedSocialAccount) {
      setSocialAccount(storedSocialAccount);
    }
    if (storedProfileImageURL) {
      setProfileImageURL(storedProfileImageURL);
    }

  }, []);



  useEffect(() => {
    const connectToWallet = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const provider = new BrowserProvider(window.ethereum);
          await provider.send('eth_requestAccounts', []);

          const zkProvider = new Provider("https://sepolia.era.zksync.dev");
          const signer = await provider.getSigner();
          const account = await signer.getAddress()
          setAccount(account)
          console.log(account)
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          setContract(contract);
          setProvider(zkProvider);
          setIsLoading(false);
          fetchPosts()
          fetchRegisteredUser()
        } else {
          throw new Error('Wallet connection not available.');
        }
      } catch (error) {
        console.error(error);
      }
    };

    connectToWallet();
  }, [account]); 

  useEffect(() => {
    const storedSocialAccount = JSON.parse(localStorage.getItem('socialAccount'));
    if (storedSocialAccount) {
      setSocialAccount(storedSocialAccount);
    }
  }, []);

  const fetchPosts = async () => {
    try {
      await getPosts();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const fetchRegisteredUser = async () => {
    if (!contract) return;
    try {
      if (account) {
        const user = await contract.getUserByAddress(account);
        console.log(user)
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
      if (!contract) return;
      setMessage('Registering, please wait!');
      const zkProvider = new Provider("https://sepolia.era.zksync.dev");

      const gasLimit = await contract.registerUser.estimateGas(username, {
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paymasterParams,
        },
      });

      const transaction = await contract.registerUser(username, {
        maxPriorityFeePerGas: 0n,
        maxFeePerGas: await zkProvider.getGasPrice(),
        gasLimit,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      });

      await transaction.wait();
      setMessage('User registered successfully.');
      setUsername('');
      fetchRegisteredUser()

    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const createPost = async () => {
    try {
      setMessage('Creating post, please wait!');
      const zkProvider = new Provider("https://sepolia.era.zksync.dev");

      const gasLimit = await contract.createPost.estimateGas(content, {
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paymasterParams,
        },
      });

      const transaction = await contract.createPost(content, {
        maxPriorityFeePerGas: 0n,
        maxFeePerGas: await zkProvider.getGasPrice(),
        gasLimit,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      });

      await transaction.wait();
      if (transaction.hash) {
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
      console.error(error);
    }
  };

  const likePost = async (postId) => {
    try {
      setMessage('Liking post, please wait!');
      const zkProvider = new Provider("https://sepolia.era.zksync.dev");

      const gasLimit = await contract.likePost.estimateGas(postId, {
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paymasterParams,
        },
      });

      const transaction = await contract.likePost(postId, {
        maxPriorityFeePerGas: 0n,
        maxFeePerGas: await zkProvider.getGasPrice(),
        gasLimit,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      });

      await transaction.wait();
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
      const zkProvider = new Provider("https://sepolia.era.zksync.dev");

      const gasLimit = await contract.addComment.estimateGas(postId, comment, {
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paymasterParams,
        },
      });

      const transaction = await contract.addComment(postId, comment, {
        maxPriorityFeePerGas: 0n,
        maxFeePerGas: await zkProvider.getGasPrice(),
        gasLimit,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams,
        },
      });

      await transaction.wait();
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

  const handleSocialLogin = (type) => {
    login(type);
    setShowModal(false);
  };


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

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = await uploadImageToIPFS(file);
      if (imageUrl) {
        console.log(imageUrl)
        setProfileImageURL(imageUrl);
        localStorage.setItem('profileImageURL', imageUrl);
      }
    }
  };

  return (
    <div>
      <Particles
        id="tsparticles"
        options={particlesOptions}
        style={{ position: "absolute", zIndex: -1, width: "100%", height: "100%" }}
      />
      <Container className="mt-5" style={{ backgroundColor: "#36394" }}>
        <Navbar bg="dark" expand="lg">
          <Container>
            <Navbar.Brand href="#" className="text-white">Social Media</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                {registeredUser && (
                  <Nav.Item>
                    <Button variant="warning" disabled>
                      {profileImageURL && (
                        <Image
                          src={profileImageURL}
                          alt="Profile Image"
                          className="rounded-circle"
                          width={30}
                          height={30}
                        />
                      )}
                      {' '}
                      {registeredUser.userAddress.slice(0, 6)}... {socialAccount.username && `(${socialAccount.username})`}
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
                <Card style={{ backgroundColor: "#1C2541" }}>
                  <Card.Body>
                    <Card.Title className="text-white">Register</Card.Title>
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
          <>
            {!socialAccount.username && (
              <Row className="mt-3">
                <Col md={6}>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                    <Card>
                      <Card.Body>
                        <Card.Title>Link Social Account</Card.Title>
                        <Button variant="primary" onClick={() => setShowModal(true)} className="mt-2">
                          <FaLink /> Link Social
                        </Button> <br />
                        <div className="form-group">
                          <label htmlFor="profileImageUpload">Upload or Update Profile Image</label>
                          <input 
                            type="file" 
                            className="form-control-file" 
                            id="profileImageUpload" 
                            onChange={handleProfileImageUpload} 
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              </Row>
            )}

            <Row className="mt-3">
              <Col md={6}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                  <Card style={{ backgroundColor: "#1C2541" }}>
                    <Card.Body>
                      <Card.Title className="text-white">Create Post</Card.Title>
                      <Form.Control         
                        as="textarea"
                        rows={3}
                        placeholder="Content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ backgroundColor: "#0B132B", color: "#c8c8c" }}
                      />
                      <Button variant="primary" onClick={createPost} disabled={isLoading} className="mt-2">
                        {isLoading ? <Spinner animation="border" size="sm" /> : 'Create Post'}
                      </Button>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </>
        )}

        <div className="mt-3">
          {message && <Alert variant="info">{message}</Alert>}
          <h3 className="text-white">Posts</h3>
          <Row>
            {posts.map((post, index) => (
              <Col md={6} key={index}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                  <Card className="shadow p-2 mb-3" style={{ backgroundColor: "#1C2541" }}>
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

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Select Social Account</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button variant="primary" onClick={() => handleSocialLogin('github')} className="m-2">
              <FaLink /> Link GitHub
            </Button>
            <Button className="m-2" variant="secondary" onClick={() => handleSocialLogin('google')}>
              <FaLink /> Link Google
            </Button>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}

export default SocialMediaComponent;
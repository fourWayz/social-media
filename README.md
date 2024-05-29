# SocialDapp Smart Contract

## Overview

**SocialDapp** is a decentralized social media platform built on the zkSync era blockchain. Users can register, create posts, like posts, and add comments. This contract ensures that only registered users can interact with the platform, maintaining a structured and secure environment.

## Contract Details

### Owner

- `address public owner`: The owner of the contract, which is set to the deployer of the contract.

### Structures

- **User**: Represents a user with a username, address, and registration status.
  ```solidity
  struct User {
      string username;
      address userAddress;
      bool isRegistered;
  }
  ```

- **Post**: Represents a post with the author's address, content, timestamp, number of likes, and comments count.
  ```solidity
  struct Post {
      address author;
      string content;
      uint256 timestamp;
      uint256 likes;
      uint256 commentsCount;
  }
  ```

- **Comment**: Represents a comment with the commenter's address, content, and timestamp.
  ```solidity
  struct Comment {
      address commenter;
      string content;
      uint256 timestamp;
  }
  ```

### Mappings

- `mapping(address => User) public users`: Stores registered users.
- `mapping(uint256 => mapping(uint256 => Comment)) public postComments`: Stores comments for each post.
- `mapping(uint256 => uint256) public postCommentsCount`: Stores the count of comments for each post.

### Arrays

- `Post[] public posts`: An array to store all posts.

### Events

- `event UserRegistered(address indexed userAddress, string username)`: Emitted when a new user registers.
- `event PostCreated(address indexed author, string content, uint256 timestamp)`: Emitted when a new post is created.
- `event PostLiked(address indexed liker, uint256 indexed postId)`: Emitted when a post is liked.
- `event CommentAdded(address indexed commenter, uint256 indexed postId, string content, uint256 timestamp)`: Emitted when a comment is added to a post.

### Modifiers

- `onlyRegisteredUser()`: Ensures that the function can only be called by a registered user.
- `onlyOwner()`: Ensures that the function can only be called by the owner of the contract.

## Functions

### Constructor

- `constructor()`: Initializes the contract, setting the deployer as the owner.

### User Functions

- `function registerUser(string memory _username) external`: Registers a new user.
- `function getUserByAddress(address _userAddress) external view returns (User memory)`: Retrieves user details by their address.

### Post Functions

- `function createPost(string memory _content) external onlyRegisteredUser`: Creates a new post.
- `function likePost(uint256 _postId) external onlyRegisteredUser`: Likes a post.
- `function addComment(uint256 _postId, string memory _content) external onlyRegisteredUser`: Adds a comment to a post.
- `function getPostsCount() external view returns (uint256)`: Returns the total number of posts.
- `function getPost(uint256 _postId) external view returns (address author, string memory content, uint256 timestamp, uint256 likes, uint256 commentsCount)`: Retrieves details of a specific post.
- `function getComment(uint256 _postId, uint256 _commentId) external view returns (address commenter, string memory content, uint256 timestamp)`: Retrieves details of a specific comment.

## Usage

### Registering a User

To register a user, call the `registerUser` function with a username:
```solidity
registerUser("myUsername");
```

### Creating a Post

To create a post, call the `createPost` function with the content of the post:
```solidity
createPost("This is my first post!");
```

### Liking a Post

To like a post, call the `likePost` function with the post ID:
```solidity
likePost(1); // Likes the post with ID 1
```

### Adding a Comment

To add a comment to a post, call the `addComment` function with the post ID and the content of the comment:
```solidity
addComment(1, "This is a comment!"); // Adds a comment to the post with ID 1
```

### Retrieving Post and Comment Details

To retrieve details of a post, call the `getPost` function with the post ID:
```solidity
getPost(1);
```

To retrieve details of a comment, call the `getComment` function with the post ID and the comment ID:
```solidity
getComment(1, 0); // Retrieves the first comment of the post with ID 1
```

## Deployment

Deploy the contract using a development environment like Truffle, Hardhat, or Remix. The constructor does not require any parameters.

## Security

- Only registered users can create posts, like posts, and add comments.
- Only the owner can perform certain administrative functions, if any are added later.


# SocialDapp Frontend Interaction Guide

## Overview

[live url](https://social-media-kappa-orpin.vercel.app/)

This guide provides instructions for interacting with the deployed SocialDapp frontend. Users can register, create posts, like posts, and add comments.

## Prerequisites

Ensure you have:

- A MetaMask wallet (or any other compatible wallet browser extension) installed and set up.
- Some zksync sepolia faucet in your wallet to cover gas fees for transactions on the zkSync network.

## Steps to Interact

### 1. Connect to Your Wallet

- Open the SocialDapp application in your browser. [live url](https://social-media-kappa-orpin.vercel.app/)
- You will be prompted to connect your Ethereum wallet.
- Approve the connection in your wallet extension (e.g., MetaMask).

### 2. Register a User

- If you are not registered, the "Create Account" section will be visible.
- Enter your desired username in the input field.
- Click the "Register" button.
- Wait for the transaction to be confirmed. You will see a message indicating successful registration.

### 3. Create a Post

- If you are registered, the "Create Post" section will be visible.
- Enter the content of your post in the textarea.
- Click the "Create Post" button.
- Wait for the transaction to be confirmed. You will see a message indicating successful post creation.

### 4. Like a Post

- Scroll down to the "Posts" section to see all posts.
- Click the "Like" button under the post you want to like.
- Wait for the transaction to be confirmed. The number of likes will be updated.

### 5. Add a Comment

- Scroll down to the "Posts" section to see all posts.
- Under the post you want to comment on, enter your comment in the input field.
- Click the "Comment" button.
- Wait for the transaction to be confirmed. The comment will be added and displayed under the post.

### 6. View Posts and Comments

- All posts are listed in the "Posts" section.
- Each post displays the author's address, content, number of likes, and comments.
- Comments are listed under each post with the commenter's address and content.

## Messages and Status

- The application displays status messages for different actions (e.g., registering, creating a post, liking a post, adding a comment).
- If an error occurs, an error message will be displayed.

## Refresh Data

- The posts and user information are automatically fetched and updated. If you need to manually refresh the data, you can refresh the browser page.


Enjoy using SocialDapp and engaging with decentralized social media on zkSync!

## License

This project is licensed under the MIT License.

---

This README provides a comprehensive guide to understanding and using the `SocialDapp`.
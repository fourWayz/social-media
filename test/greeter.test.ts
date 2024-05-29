import { expect } from 'chai';
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../deploy/utils';
import { Contract } from 'ethers';
import { Wallet } from 'zksync-ethers';

describe('SocialDapp', function () {

  let socialMedia : Contract;
  let user1 : Wallet;
  let user2 : Wallet;
  let deployer : Wallet

  before(async function() {
    user1 = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
    user2 = getWallet(LOCAL_RICH_WALLETS[2].privateKey);

    socialMedia = await deployContract("SocialDapp", [], { wallet: deployer , silent: true });
  })

  it('should register a user', async function () {
    const username = 'user1';

    await (socialMedia.connect(user1) as Contract).registerUser(username);
    const user = await socialMedia.users(user1.address);

    expect(user.username).to.equal(username);
    expect(user.userAddress).to.equal(user1.address);
    expect(user.isRegistered).to.be.true;

    const events = await socialMedia.queryFilter('UserRegistered');
    expect(events.length).to.equal(1);
    
  });

  it('should create a post', async function () {
    const content = 'This is a test post';
    await (socialMedia.connect(user1) as Contract).createPost(content);
    const postsCount = await socialMedia.getPostsCount();
    expect(postsCount.toString()).to.equal('1');

    const post = await socialMedia.getPost(0);
    expect(post.author).to.equal(user1.address);
    expect(post.content).to.equal(content);
    expect(post.likes.toString()).to.equal('0');
    expect(post.commentsCount.toString()).to.equal('0');

  });
 
  it('should like a post', async function () {
    await (socialMedia.connect(user2) as Contract).registerUser('user2');
    await (socialMedia.connect(user2) as Contract).likePost(0);
    const post = await socialMedia.getPost(0);
    expect(post.likes).to.equal(1);
    expect(post.author).to.equal(user1.address);
  
  });

  it('should add a comment to a post', async function () {
    const content = 'This is a test post';
    const commentContent = 'This is a test comment';

    await (socialMedia.connect(user2) as Contract).addComment(0, commentContent);

    const comment = await socialMedia.getComment(0, 0);
    expect(comment.commenter).to.equal(user2.address);
    expect(comment.content).to.equal(commentContent);

    const post = await socialMedia.getPost(0);
    expect(post.commentsCount).to.equal(1);

    const events = await socialMedia.queryFilter('CommentAdded');
    console.log(events)
    // expect(events.length).to.equal(1);
    // expect(events[0].args.commenter).to.equal(user2.address);
    // expect(events[0].args.postId).to.equal(0);
    // expect(events[0].args.content).to.equal(commentContent);
  });
});

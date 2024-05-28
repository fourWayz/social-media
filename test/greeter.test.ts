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
    user1 = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
    user2 = getWallet(LOCAL_RICH_WALLETS[1].privateKey);

    socialMedia = await deployContract("Freelance", [], { wallet: deployer , silent: true });
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
 
});

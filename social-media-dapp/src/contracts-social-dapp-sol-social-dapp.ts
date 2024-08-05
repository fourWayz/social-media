import {
  CommentAdded as CommentAddedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PostCreated as PostCreatedEvent,
  PostLiked as PostLikedEvent,
  UserRegistered as UserRegisteredEvent
} from "../generated/contracts/SocialDapp.sol:SocialDapp/contracts/SocialDapp.sol:SocialDapp"
import {
  CommentAdded,
  OwnershipTransferred,
  PostCreated,
  PostLiked,
  UserRegistered
} from "../generated/schema"

export function handleCommentAdded(event: CommentAddedEvent): void {
  let entity = new CommentAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.commenter = event.params.commenter
  entity.postId = event.params.postId
  entity.content = event.params.content
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePostCreated(event: PostCreatedEvent): void {
  let entity = new PostCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.author = event.params.author
  entity.content = event.params.content
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePostLiked(event: PostLikedEvent): void {
  let entity = new PostLiked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.liker = event.params.liker
  entity.postId = event.params.postId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUserRegistered(event: UserRegisteredEvent): void {
  let entity = new UserRegistered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.userAddress = event.params.userAddress
  entity.username = event.params.username

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

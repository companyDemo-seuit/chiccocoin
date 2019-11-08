const crypto = require('crypto')

class Blockchain {
  constructor() {
    // Create chain and transaction
    this.chain = []
    this.current_transactions = [] //当前所有块的交易记录
    this.nodes = []

    // Binding of this
    this.newBlock = this.newBlock.bind(this)
    this.newTransaction = this.newTransaction.bind(this)
    this.lastBlock = this.lastBlock.bind(this)
    this.proofOfWork = this.proofOfWork.bind(this) //工作证明

    // Mining  the genesis block
    this.newBlock(100, 1)//初始化第一个块的工作量 以及哈希值
  }

  newBlock(proof, previousHash) {
    const block = {
      index: this.chain.length + 1,
      timestamp: new Date(),
      transactions: this.current_transactions,
      proof: proof,
      previous_hash: previousHash
    }
    this.current_transactions = []
    this.chain.push(block)
    return block
  }
//新建交易记录，返回最新的块地址
  newTransaction(sender, recipient, amount) {
    this.current_transactions.push({
      sender: sender,
      recipient: recipient,
      amount: amount
    })
    return this.lastBlock()['index'] + 1
  }
  //计算哈希值
  hash(block) {
    const blockString = JSON.stringify(block)
    const hash = crypto.createHmac(process.env.HASH_TYPE, process.env.CRYPTO_SECRET)
      .update(blockString)
      .digest('hex')

    return hash
  }
  //是否是有效的工作
  validProof(lastProof, proof) {
    const guessHash = crypto.createHmac(process.env.HASH_TYPE, process.env.CRYPTO_SECRET)
      .update(`${lastProof}${proof}`)
      .digest('hex')
    return guessHash.substr(0, 5) === process.env.RESOLUTION_HASH
  }

  //工作量证明计算
  proofOfWork(lastProof) {
    let proof = 0
    while (true) {
      if (!this.validProof(lastProof, proof)) {
        proof++  //工作量
      } else {
        break
      }
    }
    return proof
  }
  //获取最新块
  lastBlock() {
    return this.chain.slice(-1)[0]
  }

  registerNode(address) {
    this.nodes.push(address)
    return this.nodes
  }

  //检查所有链路的块的有效性
  validChain(chain) {
    let lastBlock
    let isValid = true
    chain.forEach((block, index) => {
      if (index) {
        lastBlock = block
        return
      }
      console.log(`lastBlock`, lastBlock)
      console.log(`block`, block)
      // Check that the hash of the block is correct
      if (block['previous_hash'] !== this.hash(lastBlock)) {
        isValid = false
      }
      // Check that the Proof of Work is correct
      if (this.validProof(lastBlock.proof, block.proof)) {
        isValid = false
      }
      lastBlock = block
    })
    return isValid
  }
}

module.exports = Blockchain

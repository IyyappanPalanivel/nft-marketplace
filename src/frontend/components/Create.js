import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import axios from 'axios'

const PINATA_API_KEY = "d84e58688c30abff9dbd";
const PINATA_API_SECERET = "c00f4e75957339a972a0c8c3e74c8bc8c774b1c92f4902dc7afae3f7960ee556";


const Create = ({ marketplace, nft }) => {

  const [image, setImage] = useState('')
  const [price, setPrice] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const uploadToIPFS = async (event) => {
    console.log("event", event.target.files[0])
    event.preventDefault()
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      // try {
      //   const result = await client.add(file)
      //   console.log(result)
      //   setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
      // } catch (error) {
      //   console.log("ipfs image upload error: ", error)
      // }

      const formData = new FormData();
      formData.append('file', file)

      try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
          maxBodyLength: "Infinity",
          headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_API_SECERET,
          }
        });
        console.log(res.data);
        const result = res.data
        setImage(`https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`)
      } catch (error) {
        console.log(error);
      }
    }
  }

  const createNFT = async () => {

    var metadata = JSON.stringify({ image, price, name, description });
    console.log('input ', metadata)

    if (!image || !price || !name || !description) {
      alert('Please Enter all mandatory fields')
    } else {
      try {

        var data = JSON.stringify({
          "pinataOptions": {
            "cidVersion": 1
          },
          "pinataMetadata": {
            "name": "testing",
            "keyvalues": {}
          },
          "pinataContent": metadata
        });
        
        var config = {
          method: 'post',
          url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
          headers: { 
            'Content-Type': 'application/json', 
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_API_SECERET,
          },
          data : data
        };
        
        const res = await axios(config);
        
        console.log(res.data);
        const result = res.data

        mintThenList(result)
      } catch (error) {
        console.log("ipfs uri upload error: ", error)
      }
    }

    // if (!image || !price || !name || !description) return
    // try {
    //   const result = await client.add(JSON.stringify({ image, price, name, description }))
    //   mintThenList(result)
    // } catch (error) {
    //   console.log("ipfs uri upload error: ", error)
    // }
  }

  const mintThenList = async (result) => {
    const uri = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
  
    // mint nft 
    await (await nft.mint(uri)).wait()
    // get tokenId of new nft 
    const id = await nft.tokenCount()
    // approve marketplace to spend nft
    await (await nft.setApprovalForAll(marketplace.address, true)).wait()
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString())
    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait()
    alert('Minted')
  }

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create
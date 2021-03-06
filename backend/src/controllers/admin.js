const express = require('express');
const AdminController = (userModel, itemModel, raffleService) => {
  const router = express.Router();

  // The API path to choose a winner for all items awaiting a raffle
  router.get('/select_winners', async (req, res) => {
    // Ensure this is a real admin user calling this endpoint
    const auth_header = req.headers['authorization']
    if (auth_header == null) {
      return res.status(400).json({
        data: null,
        message: "No Authorization Received"
      });
    }
    const token = auth_header.slice(7); 

    if (token != process.env.ADMIN_AUTH_TOKEN) {
      return res.status(400).json({
        data: null,
        message: "Incorrect Authorization"
      });
    }

    // Get all items with the "AR" status

    const [items, err1] = await itemModel.getItemsWithStatus("AR");

  	if (err1) {
      return res.status(400).json({
        data: null,
        message: err1
      });
    }

    // Create promises for the chooseAndNotifyWinner function on all items
    // We use promises so this lengthy process can be run in parallel for each item
    let promises = items.map((item) => {
      return raffleService.chooseAndNotifyWinner(item);
    });

    // Run the process for all items
    const results = await Promise.all(promises)

    return res.status(200).json({
      data: results,
      message: ""
    });
    
  });


  router.post('/tracking_update', async (req, res) => {
    
    let event;
    
    try {
      event = req.body;
    } catch (err) {
      return res.status(400).json({"err": `Webhook Error: ${err.message}`});
    }

    // Handle the event
    if (event.description == 'tracker.updated' && (event.result.status == "in_transit")) {
      // get the tracking information from the event
      const tracking_object = event.result;
      const tracking_url = tracking_object.public_url
      
      // get the shipment that is associated with the tracking number
      const [shipment, err1] = await itemModel.getShipmentInformation(tracking_object.tracking_code);
      if (err1) {
        return res.status(400).json({
          data: null,
          message: err1
        });
      }

      // get the item for the shipment
      const [item, err2] = await itemModel.getItemInfo(shipment['item_id'])
      if (err2) {
        return res.status(400).json({
          data: null,
          message: err2
        });
      }

      // Now that the item has been shipped, transfer the funds from the sale to the seller
      // Subtract out the price of shipping
      // Only transfer funds if the item status is "AS" ("Awaiting Shipment")
      
      if (item['status'] == "AS") {
        let item_funds = item['current_ledger']
        
        const [updated_seller, err3] = await userModel.addUserFunds(item['seller_id'], item_funds - shipment['price'])
        if (err3) {
          return res.status(400).json({
            data: null,
            message: err3
          });
        }

        // Update the item status to "C" - completed
        
        const [updated_item, err4] = await itemModel.updateItemStatus(item['item_id'], "C")
        if (err4) {
          return res.status(400).json({
            data: null,
            message: err4
          });
        }
      }

      // get the winner information for the shipment
      const [winner, err5] = await userModel.getUserInfoById(shipment['winner_id'])
      if (err5) {
        return res.status(400).json({
          data: null,
          message: err5
        });
      }

      // send the email with the tracking url
      await raffleService.sendTrackingNumber(item, winner, tracking_url)  

      return res.status(200).json({"message": "Success"})

      } 

      // If incorrect event type, return 400
      return res.status(400).json({"message": "Unimportant event type"})
  });


  return router;
}
  
module.exports = {
  AdminController,
};

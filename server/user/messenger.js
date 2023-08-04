// Function to insert a message into the chat table
async function insertMessage(message, knex) {
  try {
    // Assuming you have a 'chat' table in your database
    const chatTable = 'chat';

    // Insert the message into the database using the 'knex' instance.
    // 'message' is an object that contains the necessary information for the message.
    // It should have properties like 'receiver_id', 'sender_id', 'status', and 'chat_object'.
    // The 'chat_object' can be a serialized version of the message object or the message content itself.
    const insertedMessageIds = await knex(chatTable).insert(message);

    // The 'insertedMessageIds' will contain an array of the inserted message IDs (if available).
    // You can use this information as needed.

    return insertedMessageIds;
  } catch (error) {
    // Handle any errors that might occur during the insertion process.
    throw error;
  }
}

// Function to send a message to users
const sendMessage = async (data, knex, io, socket, sendToRoom, receive) => {
  const usernameId = data.receive.usernameId;
  const token = data.token;
  const message = data.receive.message;
  const id = data.receive.id;

  if (usernameId && message) {
    try {
      const myProfile = await knex('users').where({ token }).select('*');
      if (myProfile.length > 0) {
        const myId = myProfile[0].id;
        if (myId) {
          const user = await knex('users').where({ id: usernameId }).select('*');
          const userAnonymous = user[0];
          // My user
          sendToRoom(myProfile[0], 'messenger', {
            type: 'messenger',
            userId: myProfile.id,
            success: true,
            noMessageError: true,
            message: {
              message,
              avatar: myProfile[0].avatar,
              id,
              userId: myProfile[0].id,
              senderId: myProfile[0].id,
              receiveId: userAnonymous.id,
            },
            id,
          }, io, socket);
          // User random
          sendToRoom(userAnonymous, 'messenger', {
            type: 'messenger',
            userId: userAnonymous.id,
            avatar: myProfile.avatar,
            success: true,
            noMessageError: true,
            message: {
              message,
              avatar: myProfile[0].avatar,
              id,
              userId: myProfile[0].id,
              senderId: myProfile[0].id,
              receiveId: userAnonymous.id,
            },
            id,
          }, io, socket);

          // Insert the message into the chat table
          await insertMessage({
            receiver_id: userAnonymous.id,
            sender_id: myProfile[0].id,
            status: 'sent',
            chat_object: {
              content: message,
              timestamp: new Date().toISOString(),
              receiver_id: userAnonymous.id,
              sender_id: myProfile[0].id,
              avatar: myProfile[0].avatar,
              username: myProfile[0].username,
              id: id
            },
          }, knex);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
};

// Function to search messages in the chat table based on receiver and sender IDs
const getMensagens = async (data, knex, io, socket, sendToRoom, receive) => {
  const userId = data.receive.user_id;
  const token = data.token;
  if (userId && token) {
    try {
      const myProfile = await knex('users').where({ token }).select('*');
      if (myProfile.length > 0) {
        // Assuming you have a 'chat' table in your database
        const chatTable = 'chat';

        // Use the 'knex' instance to query the database
        const messages = await knex(chatTable)
          .where((queryBuilder) => {
            // Query messages where receiver_id is the provided userId
            queryBuilder.orWhere('receiver_id', userId);

            // Query messages where sender_id is the provided userId
            queryBuilder.orWhere('sender_id', userId);
          })
          .select('*');


        const mensangesArray = []
        // Emit each message back to the socket using socket.emit
        messages.forEach((message) => {
          mensangesArray.push({
            message: JSON.parse(message.chat_object).content,
            avatar: JSON.parse(message.chat_object).avatar,
            id: message.id,
            userId: myProfile[0].id,
            senderId: JSON.parse(message.chat_object).sender_id,
            receiveId: JSON.parse(message.chat_object).receiver_id,
          })
        });

        socket.emit('mensagens', {
          type: 'mensagens',
          userId: myProfile.id,
          success: true,
          noMessageError: true,
          message: mensangesArray
        });

        // Optionally, you can also return the messages if needed
        return messages;
      }
    } catch (error) {
      // Handle any errors that might occur during the database query.
      console.error('Error searching messages:', error);
      throw error;
    }
  }
};

// Function to search messages in the chat table based on receiver and sender IDs
const getLastMensagens = async (data, knex, io, socket, sendToRoom, receive) => {
  const token = data.token;
  if (token) {
    try {
      const myProfile = await knex('users').where({ token }).select('*');
      if (myProfile.length > 0) {
        // Assuming you have a 'chat' table in your database
        const chatTable = 'chat';

        // Use the 'knex' instance to query the database
        const messages = await knex(chatTable)
          .where((queryBuilder) => {
            queryBuilder
              .where('receiver_id', myProfile[0].id) // Query messages where the user is the receiver
              .orWhere('sender_id', myProfile[0].id); // Query messages where the user is the sender
          })
          .orderBy('id', 'desc') // Order messages by id in descending order (latest first)
          .select('*');

        // Construct the array of messages with the appropriate username for each message
        const mensangesArray = [];
        for (const message of messages) {
          const otherUserId = message.sender_id == myProfile[0].id ? message.receiver_id : message.sender_id;
          
          const otherUser = await knex('users').where('id', otherUserId).select('*').first();
          if(!mensangesArray.find(e => e.username == otherUser.username)){
            mensangesArray.push({
              message: JSON.parse(message.chat_object).message,
              username: otherUser.username,
              id: otherUser.id,
              discrimination: otherUser.discrimination,
              avatar: otherUser.avatar,
              userId: myProfile[0].id,
              senderId: JSON.parse(message.chat_object).sender_id,
              receiveId: JSON.parse(message.chat_object).receiver_id,
            });
          }
        }

        // Emit the array of messages back to the socket using socket.emit
        socket.emit('getLastMensagens', {
          type: 'getLastMensagens',
          userId: myProfile[0].id,
          success: true,
          noMessageError: true,
          messages: mensangesArray,
        });

        // Optionally, you can also return the messages if needed
        return messages;
      }
    } catch (error) {
      // Handle any errors that might occur during the database query.
      console.error('Error searching messages:', error);
      throw error;
    }
  }
};

module.exports = { sendMessage, getMensagens, getLastMensagens };

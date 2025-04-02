// General function to extract user ID from mention, tag, or phone number
function extractUserId(message, args) {
  let userId = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || null;
  
  if (!userId && args.length > 0) {
      userId = args[0].replace(/\D/g, "") + "@s.whatsapp.net"; // Convert phone number to WhatsApp ID format
  }

  return userId;
}

// Generic function to modify group participants
async function modifyGroup(sock, group, message, args, action, successText, failureText) {
  const userId = extractUserId(message, args);
  
  if (!userId) {
      await sock.sendMessage(group, { text: "⚠️ Please mention a user or provide a phone number." });
      return;
  }

  try {
      await sock.groupParticipantsUpdate(group, [userId], action);
      await sock.sendMessage(group, { 
          text: successText.replace("{user}", `@${userId.split("@")[0]}`), 
          mentions: [userId] 
      });
  } catch (error) {
      console.error(`❌ Failed to ${action} user:`, error);
      await sock.sendMessage(group, { text: failureText });
  }
}

// ➕ Add a User
async function handleAdd(sock, group, message, args) {
  await modifyGroup(sock, group, message, args, "add", "✅ User {user} has been added.", "⚠️ Failed to add user. You need admin rights.");
}

// ❌ Remove a User
async function handleRemoveUser(sock, group, message, args) {
  await modifyGroup(sock, group, message, args, "remove", "✅ User {user} has been removed.", "⚠️ Failed to remove user. You need admin rights.");
}

// 🚫 Ban a User
async function handleBan(sock, group, message, args) {
  await modifyGroup(sock, group, message, args, "remove", "✅ User {user} has been banned.", "⚠️ You need admin rights to ban users!");
}

// 👞 Kick a User
async function handleKick(sock, group, message, args) {
  await modifyGroup(sock, group, message, args, "remove", "👞 User {user} has been kicked out.", "⚠️ You need admin rights to kick users!");
}

// 🔺 Promote a User to Admin
async function handlePromote(sock, group, message, args) {
  await modifyGroup(sock, group, message, args, "promote", "🔺 {user} has been promoted to Admin! 🎉", "⚠️ You need admin rights to promote users!");
}

// 🔻 Demote a User from Admin
async function handleDemote(sock, group, message, args) {
  await modifyGroup(sock, group, message, args, "demote", "🔻 {user} has been demoted to a regular member.", "⚠️ You need admin rights to demote users!");
}

// 🔇 Mute the Group (Only Admins Can Send Messages)
async function handleMute(sock, group) {
  try {
      await sock.groupSettingUpdate(group, "announcement");
      await sock.sendMessage(group, { text: "🔇 The group has been muted. Only admins can send messages now." });
  } catch (error) {
      console.error("❌ Failed to mute group:", error);
      await sock.sendMessage(group, { text: "⚠️ You need admin rights to mute the group!" });
  }
}

// 🔊 Unmute the Group (Everyone Can Send Messages)
async function handleUnmute(sock, group) {
  try {
      await sock.groupSettingUpdate(group, "not_announcement");
      await sock.sendMessage(group, { text: "🔊 The group has been unmuted. Everyone can send messages now." });
  } catch (error) {
      console.error("❌ Failed to unmute group:", error);
      await sock.sendMessage(group, { text: "⚠️ I need admin rights to unmute the group!" });
  }
}

// 📌 Pin a Message
async function handlePin(sock, group, message) {
  try {
      await sock.sendMessage(group, { text: `📌 Message pinned: ${message.message.conversation || "Pinned Message"}` });
  } catch (error) {
      console.error("❌ Failed to pin message:", error);
  }
}

// 📌 Unpin a Message
async function handleUnpin(sock, group) {
  try {
      await sock.sendMessage(group, { text: "📌 The pinned message has been removed." });
  } catch (error) {
      console.error("❌ Failed to unpin message:", error);
  }
}

// 🔍 Change Group Bio
async function handleBio(sock, group, args) {
  const newBio = args.join(" ");
  if (!newBio) {
      await sock.sendMessage(group, { text: "⚠️ Please provide a new bio." });
      return;
  }

  try {
      await sock.groupUpdateDescription(group, newBio);
      await sock.sendMessage(group, { text: `✅ Group bio updated to: ${newBio}` });
  } catch (error) {
      console.error("❌ Failed to update bio:", error);
  }
}

// 🏷️ Hide Tag (Mention Everyone)
async function handleHidetag(sock, group, message) {
  try {
      const participants = (await sock.groupMetadata(group)).participants.map(p => p.id);
      const textMessage = message.message.conversation || "👥 Hidden tag";

      await sock.sendMessage(group, { text: textMessage, mentions: participants });
  } catch (error) {
      console.error("❌ Failed to send hidden tag message:", error);
  }
}


// 🏷️ Tag All Members
async function handleTagAll(sock, group, message) {
  try {
      const metadata = await sock.groupMetadata(group);
      const participants = metadata.participants.map(p => `@${p.id.split("@")[0]}`);
      const botName = "Shadow-Reaper"; // Change this to your bot's name

      const textMessage = `╭───────────────────\n` +
                          `│ 💬 *Message:* ${message.message.conversation || "👥 Tagging everyone!"}\n` +
                          `│\n` +
                          `│ 🏷️ *Participants:*\n` +
                          `${participants.map(p => `│ ${p}`).join("\n")}\n` +
                          `│\n` +
                          `│───>>> 🤖 *Powered by ${botName}*\n` +
                          `╰───────────────────`;

      await sock.sendMessage(group, { text: textMessage, mentions: metadata.participants.map(p => p.id) });
  } catch (error) {
      console.error("❌ Failed to tag all members:", error);
  }
}


// 🔗 Get Invite Link
async function handleInviteLink(sock, group) {
  try {
      const code = await sock.groupInviteCode(group);
      await sock.sendMessage(group, { text: `🔗 Group Invite Link:\n https://chat.whatsapp.com/${code} \n\npowered by *Shadow-Reaper*` });
  } catch (error) {
      console.error("❌ Failed to get invite link:", error);
  }
}

// 🔄 Revoke Group Link
async function handleRevokeLink(sock, group) {
  try {
      await sock.groupRevokeInvite(group);
      await sock.sendMessage(group, { text: "✅ Group invite link has been revoked. Request for a new one" });
  } catch (error) {
      console.error("❌ Failed to revoke invite link:", error);
  }
}

// 🚫 Anti-Link Feature
async function handleAntilink(sock, group, args) {
  const setting = args[0]?.toLowerCase();
  if (!setting || (setting !== "on" && setting !== "off")) {
      await sock.sendMessage(group, { text: "⚠️ Use: antilink on/off" });
      return;
  }

  // You can implement storage for this setting, such as using a database or a JSON file.
  await sock.sendMessage(group, { text: `🔗 Anti-Link has been turned ${setting.toUpperCase()}.` });
}

// Export all functions
module.exports = {
  handleAdd,
  handleRemoveUser,
  handleBan,
  handleKick,
  handlePromote,
  handleDemote,
  handleMute,
  handleUnmute,
  handlePin,
  handleUnpin,
  handleBio,
  handleHidetag,
  handleTagAll,
  handleInviteLink,
  handleRevokeLink,
  handleAntilink
};

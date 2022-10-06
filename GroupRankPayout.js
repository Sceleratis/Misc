
/*
  Performs a fixed amount group payout to all users in a specified group rank. 
  
  Will take the funds_to_use number you specify (that is, the total amount of Robux that should be taken from the group funds) and will divide it
  equally among all eligible users in the specified group rank. 
  
  For each user, you will be prompted to confirm the payout with a simple OK/Cancel prompt. If you want this to be fully automatated simply replace the if (confirm()) line with if (true) or remove that if statement entirely. Up to you.
  
  This will not check your group funds before performing payouts, so make sure you actually have enough to cover it or it's just going to drain everything then error once empty. 

  Also note that the amount per user will be floored as you cannot payout fractions of Robux, so the actual total amount paid out may be less than what was specified.


  How to use:
  Simply login to your Roblox account, open up the developer console in whatever browser you're using (usually can be done by pressing F12)
  and paste the contents of this script into the console after making any necessary config edits and press enter.
  If all goes well it should output a bunch of info like eligibilty checks, then will start prompting you to confirm payouts. 
  All you have to do from there is click OK for each user.
*/

// Configuration options
let funds_to_use = 100;   // The total amount of funds to divide among eligible users in the specified group role.
let group = 1234567;      // The ID of your group.
let role = 7654321;       // Note: this is the actual role ID (I yoinked mine from the request to get members in a rank) and is NOT the same as the rank number you set in the group settings.

let usersPerPage = 100; // The number of users to grab per request when collecting rank users (Options are: 10, 20, 50, 100)

// Retrieves a list of users in the specified group rank.
function getUsers(callback, curPage = "", users = []) {
    $.ajax({
        url: `https://groups.roblox.com/v1/groups/${group}/roles/${role}/users?cursor=${curPage}&limit=${usersPerPage}&sortOrder=Desc`,
        success: function(data) {
            console.log("GOT DATA", data);

            users.push(...data.data);

            if (data.nextPageCursor) {
                getUsers(callback, data.nextPageCursor, users);
            } else {
                callback(users);
            }
        },
        error: function(err) {
            console.error("GETUSERS ERROR", err);
        }
    });
}

// Filters out any non-eligible users (that is, any users who cannot recieve a payout (such as being too new to the group.))
function checkPayoutEligibility(users, callback, curUser = 0, eligible = []) {
    console.log("ELIGIBILITY CHECK", curUser, users.length);
    if (curUser >= users.length) {
        callback(eligible);
    } else {
        var user = users[curUser];
        $.ajax({
            url: `https://economy.roblox.com/v1/groups/${group}/users-payout-eligibility?userIds=${user.userId}`,
            success: function(data) {
                if (data.usersGroupPayoutEligibility[user.userId] == "Eligible") {
                    eligible.push(user);
                    checkPayoutEligibility(users, callback, curUser + 1, eligible);
                }
            },
            error: function(err) {
                console.error("ELIGIBILITY ERROR", err);
            }
        });
    }
}

// Performs the payout request for a given user. This is the last step and will remove funds from your group and send them to the user it's performed on. (Not reversible)
function performPayout(user, amount) {
    $.ajax({
        url: `https://groups.roblox.com/v1/groups/${group}/payouts`,
        method: "POST",
        data: {
            PayoutType: "FixedAmount",
            Recipients: [{
                recipientId: user.userId,
                recipientType: "User",
                amount: amount
            }]
        },
        success: function(data) {
            console.log("SUCCESSFULLY PERFORMED PAYOUT OF " + amount + " TO " + user.username + " (" + user.userId + ")");
        },
        error: function(err) {
            console.error("PAYOUT ERROR", err);
        }
    });
}

// The actual process.
getUsers(function(users){
    console.log("GOT USERS", users);

    checkPayoutEligibility(users, function(eligibleUsers) {
        console.log("GOT ELIGIBLE USERS", eligibleUsers);
        
        var amount = Math.floor(funds_to_use/eligibleUsers.length);
        
        console.log("CALCULATED AMOUNT PER USER:", amount);
        
        for (i in eligibleUsers) {
            var user = eligibleUsers[i];
          
            // Prompt us to send the payout to this user (disable/remove this if-else statement if you want to make this fully automatic)
            if (confirm(`Payout ${amount} to ${user.username} (${user.userId})?`)) {
                console.log("PAYOUT USER", user);
                performPayout(user, amount);
            } else {
                console.log("SKIPPED USER", user);
            }
        }
    });
})

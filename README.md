# Jhembot

Jhembot is a raid scheduler for Guild Wars 2. It allows for easily creating sign-up posts for players to join. 

## Features
* Players can easily sign-up by clicking the corresponding emoji-reactions below the signup message and the bot will fill their name into the sign-ups.
* The raid time is shown in the local timezone for easy communication between players from different countries.
* The schedule can be viewed in 2 views:
  * the role view: Lists all the roles and everyone who signed up for those roles.
  * the player view: Lists all players who signed up and which roles they signed up as.
* If a player changes their mind and can't make it and clicks the can't make it reaction, then the bot will automatically remove all other reactions by that player from that sign-up post.
* Only the raid leader needs to know how to set up the sign-up post and the players can join or not join using the reaction buttons.

# Commands
* Players can create a new sign-up post by using the ``/schedule <date> <description>`` command, where date is in the format ``YYYY MM DD``
* Alternatively, if the description hardly ever changes, a default description can be set with the ``/setDescription <descriptio>`` command which replaces the <description> field by default in the ``/schedule`` command if left empty.
* Short hands for dates exist using the ``/mon``, ``/tue`` and so on commands for each day of the week, which setup a sign-up for the next corresponding day. So using a ``/wed`` on a Wednesday creates a sign-up post for next week's Wednesday.
* The raid time can be setup using the ``/settime start`` and ``/settime end`` commands which can be entered into description using ``<start>`` and ``<end>`` tags.
* New roles can be added with the ``/addRole <role_name> <emoji>`` command.
* Roles can be removed with the ``/removeRole <role_name>`` command.


## Example of 2 sign-up posts with the first being in role view and the 2nd being in player view:

  <img width="1236" height="1263" alt="image" src="https://github.com/user-attachments/assets/66c5d229-42e3-452e-92dc-e849f1264d45" />

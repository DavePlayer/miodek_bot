"use strict";

var _discord = _interopRequireDefault(require("discord.js"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _userList = require("./userList.js");

var _startTwitchCheck = require("./startTwitchCheck.js");

var _welcomeUser = require("./welcomeUser.js");

var _rolePunichment = require("./rolePunichment.js");

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

_dotenv["default"].config();

var Client = new _discord["default"].Client();
var Guild = new _discord["default"].Guild(Client);

var getFileJson = function getFileJson() {
  return JSON.parse(_fs["default"].readFileSync('./roles.json', 'utf-8'));
};

Client.on('ready', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          (0, _startTwitchCheck.startTwitchCheck)(Client);
          _context.prev = 1;
          Client.channels.cache.get(process.env.DISCORD_CHANNEL).send('dzialam');
          _context.next = 8;
          break;

        case 5:
          _context.prev = 5;
          _context.t0 = _context["catch"](1);
          throw _context.t0;

        case 8:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, null, [[1, 5]]);
})));
Client.on('message', function (message) {
  console.log(message.channel.id);

  if (message.channel.id == process.env.DISCORD_COMMAND_CHANNEL && message.content.includes('BOT')) {
    var regex = message.content.match(/BOT (.*)/);

    if (regex != null) {
      var command = regex[1];

      switch (true) {
        case command.includes('save users'):
          (0, _userList.makeUserList)(message, Client);
          break;

        case command.includes('punish'):
          var time = command.split(' ');
          (0, _rolePunichment.rolePunish)(Client, message.mentions.users, time[time.length - 1]);
          break;
      }
    }
  }
});
Client.on('guildMemberUpdate', function (member) {
  // niby dziala na kazda zmiane roi, ale tez zmianie pseudonimu jak i usuniecie albo dodanie uzytkownika
  (0, _userList.makeUserList)(member, Client);
});
Client.on('guildMemberAdd', function (member) {
  (0, _welcomeUser.welcomeUser)(member); // member.roles.add(member.guild.roles.cache.find(r => r.name == 'debil'))
  // user roles validation and assignment

  getFileJson().map(function (o) {
    if (typeof o.clientId != 'undefined' && o.clientId) if (o.clientId == member.user.id) {
      o.roles.map(function (role) {
        return member.roles.add(member.guild.roles.cache.find(function (r) {
          return r.name == role;
        }));
      });
    }
  });
});
console.log('działa');
Client.login(process.env.TOKEN);

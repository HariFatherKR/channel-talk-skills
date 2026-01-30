# Channel Talk Skills

**English** | [한국어](README.md)

Channel Talk Skills is a plugin marketplace that helps you easily implement all Channel Talk features in Claude Code.

## How it works

When you start a Channel Talk-related task, the skill activates automatically. Requests like "create an ALF workflow", "develop a snippet", or "integrate SDK" will trigger the skill to reference the appropriate documentation and generate code.

From environment setup to code generation and API testing, it guides you through everything needed for Channel Talk development. It creates files following your project's existing structure and conventions, using templates for rapid implementation. Supports various frameworks and languages including React, Vue, Node.js, Python, and more.

## Installation

### Claude Code (via Plugin Marketplace)

In Claude Code, register the marketplace first:

```bash
/plugin marketplace add HariFatherKR/channel-talk-skills
```

Then install the plugin:

```bash
/plugin install channel-talk@channel-talk-plugins
```

### Verify Installation

Check installation:

```bash
/help
```

```
# Should see:
# /channel-talk - Channel Talk implementation helper
```

### Environment Variables

Create `.env.local` file in your project root:

```bash
# SDK Integration (Frontend)
# Get from: Channel Talk Dashboard > General Settings > Button Installation > Install Channel Talk Button
NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY=your_plugin_key_here

# Open API (Backend)
# Get from: Channel Talk Dashboard > Security & Development > API Authentication & Management
CHANNEL_TALK_ACCESS_KEY=your_access_key_here
CHANNEL_TALK_SECRET=your_secret_here

# Snippet (Optional)
CHANNEL_TALK_SNIPPET_TOKEN=your_snippet_token_here
```

## Updating

Update the plugin:

```bash
/plugin update channel-talk@channel-talk-plugins
```

Update the marketplace:

```bash
/plugin marketplace update channel-talk-plugins
```

## The Basic Workflow

1. **Environment Check** - Verify credentials in `.env.local`. Guide setup if missing.

2. **Request Classification** - Analyze user request to identify relevant feature: ALF, Code Node, Snippet, Open API, or SDK.

3. **Reference Lookup** - Read detailed documentation and determine implementation approach.

4. **Code Generation** - Generate code based on templates following your project conventions.

5. **Testing** - Verify with API calls using `scripts/channel-api.py`.

**The skill automatically selects the appropriate feature.** Just tell it what you want.

## What's Inside

### Supported Features

| Feature | Description | Example |
|---------|-------------|---------|
| **ALF Tasks** | Workflow automation, chatbot logic | "Notify manager on refund request" |
| **Code Node** | Custom JavaScript logic in workflows | "Fetch data from external API" |
| **Snippet** | Custom agent UI panels | "Customer order history panel" |
| **Open API** | Server-side data query/manipulation | "Send messages, query users" |
| **SDK Integration** | Frontend chat button, user sync | "Sync logged-in user info" |

## Philosophy

- **Automation** - Auto-generate repetitive setup and boilerplate code
- **Consistency** - Maintain file structure following project conventions
- **Testable** - Immediate verification with API testing tools
- **Documentation-driven** - Accurate implementation using official docs as reference

## Contributing

1. Fork the repository
2. Create a branch
3. Improve reference docs or templates
4. Submit a PR

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: https://github.com/HariFatherKR/channel-talk-skills/issues
- **Channel Talk Official Docs**: https://developers.channel.io/

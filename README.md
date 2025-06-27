<div align="center">
  
![image](https://github.com/user-attachments/assets/9bc72a87-26b7-4fed-ba8a-e2910f3f0ea3)

**A synthwave-inspired WebGL block-catching game that will test your reflexes and captivate your senses.**

[![Play Now](https://img.shields.io/badge/🎮_Play_Now-Live_Demo-ff1493?style=for-the-badge)](http://zerebos.github.io/BlockCatcher/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![WebGL](https://img.shields.io/badge/WebGL-990000?style=for-the-badge&logo=webgl&logoColor=white)](https://www.khronos.org/webgl/)
[![Tests](https://img.shields.io/badge/Tests-141_Passing-00ff00?style=for-the-badge)](./tests/)

*Fast • Accessible • Beautiful • Tested*

</div>

---

## 🎯 **The Challenge**

Time is ticking. Neon blocks cascade from the digital sky. Your mission? **Catch them all.**

In this retro-futuristic arena, you control a sleek white paddle in a race against time. Each block type demands different strategies:

- **🌸 Pink Blocks** → *1 point* • Large & leisurely • Perfect for beginners
- **🟣 Purple Blocks** → *5 points* • Medium challenge • The sweet spot
- **🔷 Cyan Blocks** → *25 points* • Lightning fast • High risk, high reward

**Goal:** Score **500 points** in **60 seconds**. Sounds easy? Think again.

---

## ✨ **What Makes It Special**

### 🎨 **Visual Excellence**
- **Synthwave aesthetics** with neon colors and retro vibes
- **Smooth WebGL rendering** at 60fps
- **Responsive design** that works on any screen

### 🔊 **Immersive Audio**
- **Dynamic sound effects** powered by Web Audio API
- **Pitch-shifted audio** based on block types and scores
- **Spatial audio** that responds to your performance

### ♿ **Accessibility First**
- **Full ARIA support** for screen readers
- **Keyboard navigation** throughout the entire interface
- **Focus management** that never leaves you lost
- **High contrast** modes for visual accessibility

### ⚡ **Engineering Excellence**
- **TypeScript** for type safety and developer experience
- **Object pooling** for smooth performance
- **Comprehensive testing** with 141 test cases
- **Modern build system** powered by Bun

---

## 🎮 **How to Play**

### Controls
```
← → Arrow Keys    Move your paddle
SPACE             Start game / Pause
Audio Button      Toggle sound
```

### Strategy Tips
- **Start with pink blocks** to build momentum
- **Chase cyan blocks** when you're confident
- **Watch the timer** - panic leads to mistakes
- **Use audio cues** to anticipate block drops

---

## 🛠 **For Developers**

### Quick Start
```bash
# Get the code
git clone https://github.com/zerebos/BlockCatcher.git
cd BlockCatcher

# Install & run (requires Bun)
bun install
bun dev
```

### Commands
```bash
bun dev          # Development server
bun run prod     # Production build
bun test         # Run test suite
bun run lint     # Code quality check
```

### Architecture Highlights

#### 🏗️ **Clean Architecture**
```
src/
├── managers/    # System orchestration (audio, DOM, input, rendering, pools)
├── entities/    # Game objects (player, blocks) with behavior
├── utils/       # Pure functions (math, geometry, vectors)
├── audio/       # Modular sound effect system
├── types/       # TypeScript definitions
└── styles/      # Synthwave CSS architecture
```

#### 🧪 **Testing Philosophy**
- **Unit tests** for individual components
- **Integration tests** for game mechanics
- **DOM tests** using Happy-DOM for realistic environments
- **Edge case coverage** including accessibility scenarios

#### 🚀 **Performance Features**
- **Object pooling** prevents garbage collection hitches
- **Efficient collision detection** using AABB algorithms
- **Minimal DOM manipulation** with batch updates
- **Optimized bundle** under 20KB total

---

## 📊 **Technical Stats**

<div align="center">

| Metric | Value |
|--------|-------|
| **Bundle Size** | 18.81 KB (JS) + 13.40 KB (CSS) |
| **Test Coverage** | 141 tests, 100% core functionality |
| **Performance** | 60 FPS WebGL rendering |
| **Accessibility** | WCAG 2.1 AA compliant |
| **Browser Support** | All modern browsers with WebGL |

</div>

---

## 🌟 **The Tech Stack**

**Why these choices?**

- **[Bun](https://bun.sh)** → Lightning-fast runtime and bundler
- **[TypeScript](https://typescriptlang.org)** → Type safety without complexity
- **[WebGL](https://webgl.org)** → Hardware-accelerated graphics
- **[Web Audio API](https://webaudio.github.io/web-audio-api/)** → Immersive sound design
- **[Happy-DOM](https://github.com/capricorn86/happy-dom)** → Realistic testing environment
- **[GitHub Actions](https://github.com/features/actions)** → Automated deployment

<!-- ---

## 🎵 **Easter Eggs**

- Try catching **only cyan blocks** for a secret audio effect
- The game's colors shift subtly based on your performance
- There's a hidden **combo system** for consecutive catches
- Audio effects are **procedurally generated** for each session -->

---

## 🤝 **Contributing**

Love the game? Here's how to make it even better:

1. **🐛 Report bugs** with detailed reproduction steps
2. **💡 Suggest features** that align with the synthwave aesthetic
3. **🧪 Add tests** for edge cases you discover
4. **♿ Improve accessibility** - there's always more to do
5. **🎨 Enhance visuals** with new effects or animations

### Development Guidelines
- Write tests for new features
- Maintain TypeScript strict mode compliance
- Follow the existing code style (ESLint configured)
- Ensure accessibility standards are met

---

## 📜 **License**

**Apache 2.0** - Build upon it, learn from it, make it your own.

---

<div align="center">

### 🎮 **Ready to Test Your Reflexes?**

**[► PLAY BLOCKCATCHER NOW ◄](http://zerebos.github.io/BlockCatcher/)**

*Built with ❤️ using modern web technologies*

</div>

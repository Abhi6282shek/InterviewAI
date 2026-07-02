class AIAvatar {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.state = 'idle'; // 'idle', 'speaking', 'listening', 'thinking'
        this.particles = [];
        this.angle = 0;
        this.init();
        this.animate();
    }
    
    init() {
        this.canvas.width = 120;
        this.canvas.height = 120;
        this.particles = [];
        
        // Generate coordinates for neural mesh
        for (let i = 0; i < 36; i++) {
            this.particles.push({
                angle: (i / 36) * Math.PI * 2,
                speed: 0.015 + Math.random() * 0.02,
                radius: 36 + Math.random() * 6,
                baseRadius: 36 + Math.random() * 6,
                size: 1.2 + Math.random() * 1.8
            });
        }
    }
    
    setState(state) {
        this.state = state;
    }
    
    animate() {
        if (!this.ctx) return;
        requestAnimationFrame(() => this.animate());
        
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        
        ctx.clearRect(0, 0, w, h);
        
        this.angle += 0.035;
        
        // Dynamic colors by state
        let color = 'rgba(99, 102, 241, 0.9)'; // Indigo (Idle)
        if (this.state === 'speaking') {
            color = 'rgba(168, 85, 247, 0.95)'; // Purple/Magenta (Speaking)
        } else if (this.state === 'listening') {
            color = 'rgba(16, 185, 129, 0.95)'; // Green/Emerald (Listening)
        } else if (this.state === 'thinking') {
            color = 'rgba(245, 158, 11, 0.95)'; // Amber/Orange (Thinking)
        }
        
        // Expanding aura ripple
        ctx.beginPath();
        let rippleRad = 42;
        if (this.state === 'speaking') {
            rippleRad = 42 + Math.sin(this.angle * 6.5) * 8;
        } else if (this.state === 'listening') {
            rippleRad = 42 + Math.sin(this.angle * 2) * 3;
        }
        ctx.arc(cx, cy, rippleRad, 0, Math.PI * 2);
        ctx.strokeStyle = color.replace('0.95', '0.1').replace('0.9', '0.1');
        ctx.lineWidth = 5;
        ctx.stroke();
        
        // Calculate points
        const points = [];
        this.particles.forEach((p, idx) => {
            if (this.state === 'speaking') {
                p.angle += p.speed * 1.6;
                p.radius = p.baseRadius + Math.sin(this.angle * 6 + idx) * 11;
            } else if (this.state === 'listening') {
                p.angle += p.speed;
                p.radius = p.baseRadius + Math.sin(this.angle * 2.5 + idx) * 4;
            } else if (this.state === 'thinking') {
                p.angle += 0.075; // Fast spin
                p.radius = p.baseRadius + Math.sin(p.angle * 4) * 2;
            } else {
                p.angle += p.speed * 0.6;
                p.radius = p.baseRadius + Math.sin(this.angle + idx) * 2.5;
            }
            
            const px = cx + Math.cos(p.angle) * p.radius;
            const py = cy + Math.sin(p.angle) * p.radius;
            points.push({ x: px, y: py });
        });
        
        // Draw mesh lines
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
            const next = points[(i + 1) % points.length];
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(next.x, next.y);
            
            // Connect to nearby center particles for structural grid look
            if (i % 3 === 0) {
                const diagIndex = (i + 12) % points.length;
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[diagIndex].x, points[diagIndex].y);
            }
        }
        ctx.strokeStyle = color.replace('0.95', '0.2').replace('0.9', '0.2');
        ctx.lineWidth = 0.8;
        ctx.stroke();
        
        // Draw node points
        points.forEach((pt, idx) => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, this.particles[idx].size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        });
        
        // Core glow sphere
        const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 26);
        if (this.state === 'speaking') {
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.35, '#c084fc');
            grad.addColorStop(1, 'transparent');
        } else if (this.state === 'listening') {
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.35, '#34d399');
            grad.addColorStop(1, 'transparent');
        } else if (this.state === 'thinking') {
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.35, '#fbbf24');
            grad.addColorStop(1, 'transparent');
        } else {
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.35, '#818cf8');
            grad.addColorStop(1, 'transparent');
        }
        
        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
    }
}

import React, { useState, useEffect, useRef } from 'react';
import { Play, RefreshCw, Trophy, Clock, DollarSign, Target, X } from 'lucide-react';
import BottomNavBar from './BottomNavBar';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface GameResult {
  drawnNumbers: number[];
  matches: number;
  payout: number;
  timestamp: Date;
}

interface WinDisplay {
  show: boolean;
  matches: number;
  payout: number;
  selectedCount: number;
}

let particleIdCounter = 0;

export default function KenoGame() {
  let particleIdCounter = 0;
  
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [isDrawing, setIsDrawing] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [particleId, setParticleId] = useState(0);
  const [currentlyDrawing, setCurrentlyDrawing] = useState<number[]>([]);
  const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuTab, setMobileMenuTab] = useState<'recent' | 'result' | 'payout'>('recent');
  const [winDisplay, setWinDisplay] = useState<WinDisplay>({
    show: false,
    matches: 0,
    payout: 0,
    selectedCount: 0
  });
  const [infoClosing, setInfoClosing] = useState(false);
  const [showPayoutLegend, setShowPayoutLegend] = useState(false);

  // Auto-close info modal after 10 seconds with timer
  const [infoTimer, setInfoTimer] = useState(10);
  
  useEffect(() => {
    if (showInfo) {
      setInfoTimer(10);
      const interval = setInterval(() => {
        setInfoTimer(prev => {
          if (prev <= 1) {
            setShowInfo(false);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showInfo]);


  // Particle cleanup effect
  useEffect(() => {
    const cleanup = setInterval(() => {
      setParticles(prev => prev.filter(p => p.life > 5));
    }, 1000);
    return () => clearInterval(cleanup);
  }, []);

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.2,
        life: particle.life - 1
      })).filter(p => p.life > 0));

      particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life / 30;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [particles]);

  const createParticles = (x: number, y: number, color: string) => {
    // Clear existing particles first
    setParticles([]);
    
    setTimeout(() => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 8; i++) {
        newParticles.push({
          id: particleIdCounter++,
          x,
          y,
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * -8 - 2,
          life: 30,
          color
        });
      }
      setParticles(newParticles);
    }, 10);
  };

  const toggleNumber = (number: number) => {
    // Add brief highlight animation
    setHighlightedNumber(number);
    setTimeout(() => setHighlightedNumber(null), 200);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = ((number - 1) % 10) * 60 + 30;
      const y = Math.floor((number - 1) / 10) * 60 + 30;
      createParticles(x, y, selectedNumbers.includes(number) ? '#3b82f6' : '#10b981');
    }

    setSelectedNumbers(prev => 
      prev.includes(number) 
        ? prev.filter(n => n !== number)
        : prev.length < 10 
          ? [...prev, number]
          : prev
    );
  };

  const PayoutLegend = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-black/90 backdrop-blur-lg border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Complete Payout Guide</h3>
          <button
            onClick={() => setShowPayoutLegend(false)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <div className="space-y-6 text-white">
          <div>
            <h4 className="text-xl font-semibold mb-3 text-purple-400">🎯 How Keno Payouts Work</h4>
            <p className="text-base text-slate-300 mb-4">
              Payouts are calculated based on two factors: <strong>how many numbers you select (spots)</strong> and <strong>how many of those numbers match</strong> the 20 drawn numbers. The more numbers you select, the higher potential payouts become, but the odds of hitting all numbers decrease significantly.
            </p>
          </div>
          
          {/* Complete Payout Table */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-purple-400">💰 Complete Payout Table</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1-5 Spots */}
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-lg font-semibold text-blue-400 mb-3">1 Spot Selected</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>1 match:</span>
                      <span className="text-green-400 font-bold">3x bet</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Odds: 1 in 4 (25% chance)
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-lg font-semibold text-blue-400 mb-3">2 Spots Selected</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>2 matches:</span>
                      <span className="text-green-400 font-bold">12x bet</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Odds: 1 in 17 (6% chance)
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-lg font-semibold text-blue-400 mb-3">3 Spots Selected</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>2 matches:</span>
                      <span className="text-green-400 font-bold">1x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3 matches:</span>
                      <span className="text-green-400 font-bold">42x bet</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      3 matches odds: 1 in 73 (1.4% chance)
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-lg font-semibold text-blue-400 mb-3">4 Spots Selected</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>2 matches:</span>
                      <span className="text-green-400 font-bold">1x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3 matches:</span>
                      <span className="text-green-400 font-bold">4x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4 matches:</span>
                      <span className="text-green-400 font-bold">120x bet</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      4 matches odds: 1 in 327 (0.3% chance)
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-lg font-semibold text-blue-400 mb-3">5 Spots Selected</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>3 matches:</span>
                      <span className="text-green-400 font-bold">1x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4 matches:</span>
                      <span className="text-green-400 font-bold">12x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>5 matches:</span>
                      <span className="text-green-400 font-bold">750x bet</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      5 matches odds: 1 in 1,551 (0.06% chance)
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 6-10 Spots */}
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-lg font-semibold text-blue-400 mb-3">6 Spots Selected</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>3 matches:</span>
                      <span className="text-green-400 font-bold">1x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4 matches:</span>
                      <span className="text-green-400 font-bold">3x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>5 matches:</span>
                      <span className="text-green-400 font-bold">75x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>6 matches:</span>
                      <span className="text-green-400 font-bold">1,500x bet</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      6 matches odds: 1 in 7,753 (0.01% chance)
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-lg font-semibold text-blue-400 mb-3">7 Spots Selected</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>4 matches:</span>
                      <span className="text-green-400 font-bold">1x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>5 matches:</span>
                      <span className="text-green-400 font-bold">20x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>6 matches:</span>
                      <span className="text-green-400 font-bold">400x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>7 matches:</span>
                      <span className="text-green-400 font-bold">7,500x bet</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      7 matches odds: 1 in 40,980 (0.002% chance)
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-lg font-semibold text-blue-400 mb-3">8 Spots Selected</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>5 matches:</span>
                      <span className="text-green-400 font-bold">10x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>6 matches:</span>
                      <span className="text-green-400 font-bold">80x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>7 matches:</span>
                      <span className="text-green-400 font-bold">1,000x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>8 matches:</span>
                      <span className="text-green-400 font-bold">15,000x bet</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      8 matches odds: 1 in 230,115 (0.0004% chance)
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-lg font-semibold text-blue-400 mb-3">9 Spots Selected</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>5 matches:</span>
                      <span className="text-green-400 font-bold">5x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>6 matches:</span>
                      <span className="text-green-400 font-bold">50x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>7 matches:</span>
                      <span className="text-green-400 font-bold">300x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>8 matches:</span>
                      <span className="text-green-400 font-bold">4,000x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>9 matches:</span>
                      <span className="text-green-400 font-bold">25,000x bet</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      9 matches odds: 1 in 1,380,688 (0.00007% chance)
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-lg font-semibold text-blue-400 mb-3">10 Spots Selected</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>5 matches:</span>
                      <span className="text-green-400 font-bold">2x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>6 matches:</span>
                      <span className="text-green-400 font-bold">20x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>7 matches:</span>
                      <span className="text-green-400 font-bold">80x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>8 matches:</span>
                      <span className="text-green-400 font-bold">500x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>9 matches:</span>
                      <span className="text-green-400 font-bold">4,500x bet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>10 matches:</span>
                      <span className="text-green-400 font-bold">50,000x bet</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      10 matches odds: 1 in 8,911,712 (0.00001% chance)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Strategy Section */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-purple-400">🎲 Advanced Strategy Guide</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-lg font-semibold text-green-400 mb-3">🎯 Beginner Strategy</div>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li>• <strong>Start with 4-6 numbers:</strong> Good balance of odds and payouts</li>
                  <li>• <strong>Conservative betting:</strong> Bet 1-5% of your balance</li>
                  <li>• <strong>Expect frequent small wins:</strong> 2-3 matches are common</li>
                  <li>• <strong>Set win/loss limits:</strong> Know when to stop</li>
                </ul>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-lg font-semibold text-yellow-400 mb-3">⚡ High Risk Strategy</div>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li>• <strong>8-10 numbers:</strong> Massive payouts but very rare wins</li>
                  <li>• <strong>Higher bet amounts:</strong> Go big when you feel lucky</li>
                  <li>• <strong>Jackpot hunting:</strong> Aim for the 15,000x+ multipliers</li>
                  <li>• <strong>Patience required:</strong> May take many games to hit</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Odds Explanation */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-purple-400">📊 Understanding the Odds</h4>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-green-400 font-semibold mb-2">Best Odds (Frequent Wins)</div>
                  <ul className="text-slate-300 space-y-1">
                    <li>1 spot: 25% chance</li>
                    <li>2 spots: 6% chance</li>
                    <li>3 spots: 14% chance (2+ matches)</li>
                  </ul>
                </div>
                <div>
                  <div className="text-yellow-400 font-semibold mb-2">Balanced (Moderate Wins)</div>
                  <ul className="text-slate-300 space-y-1">
                    <li>4-6 spots: 1-5% chance</li>
                    <li>Good payout potential</li>
                    <li>Reasonable hit frequency</li>
                  </ul>
                </div>
                <div>
                  <div className="text-red-400 font-semibold mb-2">Long Shots (Rare Jackpots)</div>
                  <ul className="text-slate-300 space-y-1">
                    <li>7+ spots: &lt;0.1% chance</li>
                    <li>Massive payouts possible</li>
                    <li>Very rare wins</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pro Tips */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-purple-400">💡 Pro Tips</h4>
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-4">
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• <strong>House Edge:</strong> Keno typically has a 25-40% house edge - play for fun, not profit</li>
                <li>• <strong>Number Selection:</strong> All numbers have equal probability - patterns don't matter</li>
                <li>• <strong>Bankroll Management:</strong> Never bet more than you can afford to lose</li>
                <li>• <strong>Hot/Cold Numbers:</strong> Past results don't affect future draws - each game is independent</li>
                <li>• <strong>Maximum Payouts:</strong> Some casinos cap payouts regardless of multiplier</li>
                <li>• <strong>Variance:</strong> Expect long losing streaks even with good odds</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getPayoutMultiplier = (spots: number, matches: number): number => {
    const payoutTable: { [key: number]: { [key: number]: number } } = {
      1: { 1: 3 },
      2: { 2: 12 },
      3: { 2: 1, 3: 42 },
      4: { 2: 1, 3: 4, 4: 120 },
      5: { 3: 1, 4: 12, 5: 750 },
      6: { 3: 1, 4: 3, 5: 75, 6: 1500 },
      7: { 4: 1, 5: 20, 6: 400, 7: 7500 },
      8: { 5: 10, 6: 80, 7: 1000, 8: 15000 },
      9: { 5: 5, 6: 50, 7: 300, 8: 4000, 9: 25000 },
      10: { 5: 2, 6: 20, 7: 80, 8: 500, 9: 4500, 10: 50000 }
    };
    return payoutTable[spots]?.[matches] || 0;
  };

  const drawNumbers = async () => {
    if (selectedNumbers.length === 0 || balance < bet) return;
    
    setIsDrawing(true);
    setCurrentlyDrawing([]);
    setBalance(prev => prev - bet);
    
    // Clear particles before drawing
    setParticles([]);
    
    const drawn: number[] = [];
    const allNumbers = Array.from({ length: 80 }, (_, i) => i + 1);
    
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const randomIndex = Math.floor(Math.random() * allNumbers.length);
      const drawnNumber = allNumbers.splice(randomIndex, 1)[0];
      drawn.push(drawnNumber);
      setCurrentlyDrawing([...drawn]);
    }
    
    setDrawnNumbers(drawn);
    
    const matches = selectedNumbers.filter(num => drawn.includes(num)).length;
    const multiplier = getPayoutMultiplier(selectedNumbers.length, matches);
    const payout = bet * multiplier;
    
    if (payout > 0) {
      setBalance(prev => prev + payout);
    }
    
    const result: GameResult = {
      drawnNumbers: drawn,
      matches,
      payout,
      timestamp: new Date()
    };
    
    setLastResult(result);
    setGameHistory(prev => [result, ...prev.slice(0, 9)]);
    setCurrentlyDrawing([]);
    
    // Show win display
    setWinDisplay({
      show: true,
      matches,
      payout,
      selectedCount: selectedNumbers.length
    });
    
    // Hide win display after 4 seconds
    setTimeout(() => {
      setWinDisplay(prev => ({ ...prev, show: false }));
      // Auto-clear the board after win display hides
      setTimeout(() => {
        resetGame();
      }, 500); // Small delay after win display disappears
    }, 4000);
    
    setIsDrawing(false);
  };

  const resetGame = () => {
    setSelectedNumbers([]);
    setDrawnNumbers([]);
    setLastResult(null);
    setParticles([]);
    setCurrentlyDrawing([]);
    setHighlightedNumber(null);
    particleIdCounter = 0;
  };

  const InfoModal = () => (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 md:p-4" 
      style={{ zIndex: 9999 }}
    >
      <div className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-2xl max-w-sm md:max-w-2xl w-full max-h-[85vh] md:max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="p-4 md:p-8 pb-2 md:pb-4 flex justify-between items-center border-b border-white/10">
          <h2 className="text-xl md:text-3xl font-bold text-white">How to Play Keno</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/10 px-2 md:px-3 py-1 md:py-2 rounded-lg">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" />
              <span className="text-white font-bold text-sm md:text-base">{infoTimer}s</span>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-8 pt-2 md:pt-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="space-y-4 md:space-y-6 text-white">
            <div>
              <h3 className="text-base md:text-xl font-semibold mb-2 md:mb-3 text-purple-400">🎯 Game Objective</h3>
              <p className="text-xs md:text-base text-slate-300">Select up to 10 numbers from 1-80. The more numbers you match with the 20 drawn numbers, the bigger your payout!</p>
            </div>
            
            <div>
              <h3 className="text-base md:text-xl font-semibold mb-2 md:mb-3 text-purple-400">🎮 How to Play</h3>
              <ol className="list-decimal list-inside space-y-1 md:space-y-2 text-xs md:text-base text-slate-300">
                <li>Click on 1-10 numbers on the board to select them (blue)</li>
                <li>Set your bet amount using the input or quick bet buttons</li>
                <li>Click "Draw Numbers" to start the game</li>
                <li>Watch as 20 numbers are drawn one by one</li>
                <li>Win based on how many of your numbers match!</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-base md:text-xl font-semibold mb-2 md:mb-3 text-purple-400">🎨 Number Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg"></div>
                  <span className="text-xs md:text-base text-slate-300">Selected numbers</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg"></div>
                  <span className="text-xs md:text-base text-slate-300">Currently being drawn</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg"></div>
                  <span className="text-xs md:text-base text-slate-300">Matched numbers (WIN!)</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg"></div>
                  <span className="text-xs md:text-base text-slate-300">Drawn (no match)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-base md:text-xl font-semibold mb-2 md:mb-3 text-purple-400">💰 Payouts</h3>
              <p className="text-xs md:text-base text-slate-300 mb-2 md:mb-3">Payouts depend on how many numbers you select and how many match:</p>
              <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
                <div className="text-xs md:text-sm text-slate-400 mb-2">Example: Select 5 numbers</div>
                <div className="space-y-1 text-xs md:text-sm">
                  <div className="flex justify-between"><span>3 matches:</span><span className="text-green-400">1x bet</span></div>
                  <div className="flex justify-between"><span>4 matches:</span><span className="text-green-400">12x bet</span></div>
                  <div className="flex justify-between"><span>5 matches:</span><span className="text-green-400">750x bet</span></div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-base md:text-xl font-semibold mb-2 md:mb-3 text-purple-400">💡 Tips</h3>
              <ul className="list-disc list-inside space-y-1 md:space-y-2 text-xs md:text-base text-slate-300">
                <li>More numbers selected = higher potential payouts but lower odds</li>
                <li>Fewer numbers selected = lower payouts but better odds</li>
                <li>Check the payout table on the right to see potential winnings</li>
                <li>Use quick bet buttons for common bet amounts</li>
              </ul>
            </div>
            
            {/* Bottom padding to ensure last content is visible */}
            <div className="h-4 md:h-6"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const WinDisplayOverlay = () => {
    if (!winDisplay.show) return null;
    
    const isWin = winDisplay.payout > 0;
    
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-black/90 to-blue-900/80 border-2 border-red-500/30 rounded-3xl p-8 md:p-12 shadow-2xl max-w-md w-full mx-4 text-center animate-in zoom-in duration-500 backdrop-blur-md">
          {/* Result Icon */}
          <div className="mb-6">
            {isWin ? (
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                <Trophy className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                <Target className="w-10 h-10 md:w-12 md:h-12 text-white opacity-60" />
              </div>
            )}
          </div>
          
          {/* Win/Loss Text */}
          <div className="mb-6">
            <h2 className={`text-3xl md:text-4xl font-black mb-2 ${isWin ? 'text-green-400' : 'text-slate-400'}`}>
              {isWin ? 'YOU WIN!' : 'NO WIN'}
            </h2>
            <p className="text-lg md:text-xl text-white/80">
              {winDisplay.matches} out of {winDisplay.selectedCount} numbers matched
            </p>
          </div>
          
          {/* Payout Amount */}
          <div className="mb-6">
            <div className={`text-4xl md:text-5xl font-black ${isWin ? 'text-green-400' : 'text-red-400'}`}>
              {isWin ? '+' : ''}${winDisplay.payout.toLocaleString()}
            </div>
            {isWin && (
              <p className="text-sm md:text-base text-white/60 mt-2">
                Added to your balance
              </p>
            )}
          </div>
          
          {/* Celebration Effects for Wins */}
          {isWin && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
              <div className="absolute top-8 right-6 w-1 h-1 bg-green-400 rounded-full animate-ping animation-delay-200"></div>
              <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping animation-delay-500"></div>
              <div className="absolute bottom-4 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping animation-delay-700"></div>
              <div className="absolute top-1/2 left-2 w-1 h-1 bg-red-300 rounded-full animate-ping animation-delay-1000"></div>
              <div className="absolute top-1/3 right-2 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping animation-delay-300"></div>
            </div>
          )}
          
        </div>
      </div>
    );
  };
  const getPayoutTable = () => {
    if (selectedNumbers.length === 0) return [];
    
    const spots = selectedNumbers.length;
    const table = [];
    
    for (let matches = 0; matches <= spots; matches++) {
      const multiplier = getPayoutMultiplier(spots, matches);
      if (multiplier > 0) {
        table.push({ matches, payout: bet * multiplier });
      }
    }
    
    return table.reverse();
  };

const MobileMenu = ({
  onClose,
  activeTab,
  setActiveTab,
  gameHistory,
  lastResult,
  selectedNumbers,
  getPayoutTable
}: {
  onClose: () => void;
  activeTab: 'recent' | 'result' | 'payout';
  setActiveTab: (tab: 'recent' | 'result' | 'payout') => void;
  gameHistory: GameResult[];
  lastResult: GameResult | null;
  selectedNumbers: number[];
  getPayoutTable: () => { matches: number; payout: number }[];
}) => (
  <div className="fixed inset-0 z-50 md:hidden">
    {/* Menu panel - should be on top */}
    <div className="absolute left-0 top-0 z-20 bg-black/90 backdrop-blur-lg border-r border-white/20 w-80 h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Game Info</h2>
          <button
            onClick={() => setShowMobileMenu(false)}
            className="p-2 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMobileMenuTab('recent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mobileMenuTab === 'recent' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/10 text-slate-300 active:bg-white/30'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setMobileMenuTab('result')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mobileMenuTab === 'result' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/10 text-slate-300 active:bg-white/30'
              }`}
            >
              Result
            </button>
            <button
              onClick={() => setMobileMenuTab('payout')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mobileMenuTab === 'payout' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/10 text-slate-300 active:bg-white/30'
              }`}
            >
              Payouts
            </button>
          </div>
          
          {/* Tab Content */}
          {mobileMenuTab === 'recent' && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-300" />
                Recent Games
              </h3>
              <div className="space-y-3">
                {gameHistory.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-base">No games played yet</p>
                    <p className="text-sm">Your game history will appear here</p>
                  </div>
                ) : (
                  gameHistory.map((game, index) => (
                    <div key={index} className="bg-slate-800/50 rounded-lg p-3 border border-slate-600">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300">
                          {game.timestamp.toLocaleTimeString()}
                        </span>
                        <span className={`font-bold text-base ${game.payout > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {game.payout > 0 ? '+' : ''}${game.payout}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        {game.matches} matches
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {mobileMenuTab === 'result' && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-purple-300" />
                Last Result
              </h3>
              {!lastResult ? (
                <div className="text-center py-8 text-slate-400">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-base">No results yet</p>
                  <p className="text-sm">Play a game to see results</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${lastResult.payout > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {lastResult.payout > 0 ? '+' : ''}${lastResult.payout}
                    </div>
                    <div className="text-base text-slate-300">
                      {lastResult.matches} matches out of {selectedNumbers.length}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Drawn Numbers:</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {lastResult.drawnNumbers.map((num, index) => (
                        <div
                          key={index}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            selectedNumbers.includes(num)
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-600 text-slate-300'
                          }`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {mobileMenuTab === 'payout' && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-purple-300" />
                Payout Table
              </h3>
              <div className="space-y-3">
                {selectedNumbers.length === 0 ? (
                  <>
                    <div className="text-center py-4 text-slate-400 border-b border-slate-600 mb-3">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Select numbers to see payouts</p>
                      <p className="text-xs">Choose 1-10 numbers to play</p>
                    </div>
                    {/* Show placeholder payout rows for mobile */}
                    {Array.from({ length: 6 }, (_, i) => (
                      <div
                        key={i}
                        className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50 opacity-40"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">- matches</span>
                          <span className="font-bold text-base text-slate-500">$-</span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  getPayoutTable().map(({ matches, payout }) => (
                    <div
                      key={matches}
                      className="bg-slate-800/50 rounded-lg p-3 border border-slate-600"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">{matches} matches</span>
                        <span className="font-bold text-base text-green-400">${payout.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
        onError={(e) => console.error('Video failed to load:', e)}
        onLoadStart={() => console.log('Video loading started')}
        onCanPlay={() => console.log('Video can play')}
      >
        <source src="/videos/trimmed.mp4" type="video/mp4" />
        <source src="./videos/trimmed.mp4" type="video/mp4" />
      </video>
      
      {/* Dark overlay for better readability */}
      <div className="fixed inset-0 bg-black/30 z-0"></div>
      
      <canvas
        ref={canvasRef}
        width={600}
        height={480}
        className="fixed inset-0 pointer-events-none z-10"
      />
      
      <div className="max-w-7xl mx-auto relative z-10 h-full flex flex-col">
        {/* Header - Fixed height on mobile */}
        <div className="text-center py-2 md:mb-8 flex-shrink-0">
          <img 
            src="/hello.png" 
            alt="KENO" 
            className="mx-auto h-16 md:h-32 object-contain drop-shadow-2xl"
          />
        </div>
        
        <BottomNavBar 
          balance={balance}
          bet={bet}
          setBet={setBet}
          selectedNumbers={selectedNumbers}
          isDrawing={isDrawing}
          onShowInfo={() => setShowInfo(true)}
          onShowPayoutLegend={() => setShowPayoutLegend(true)}
        />

        {showInfo && <InfoModal />}
        {showPayoutLegend && <PayoutLegend />}
        {winDisplay.show && <WinDisplayOverlay />}

        {/* Desktop Layout */}
        <div className="grid grid-cols-12 gap-6 hidden md:grid">
          {/* Left Sidebar - Recent Games & Game Result */}
          <div className="col-span-3 space-y-8">
            {/* Recent Games */}
            <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-purple-300" />
                Recent Games
              </h3>
              <div className="space-y-4 max-h-70 overflow-y-auto">
                {gameHistory.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No games played yet</p>
                    <p className="text-base">Your game history will appear here</p>
                  </div>
                ) : (
                  gameHistory.map((game, index) => (
                    <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-base text-slate-300">
                          {game.timestamp.toLocaleTimeString()}
                        </span>
                        <span className={`font-bold text-lg ${game.payout > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {game.payout > 0 ? '+' : ''}${game.payout}
                        </span>
                      </div>
                      <div className="text-base text-slate-400">
                        {game.matches} matches
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Game Result */}
            <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-purple-300" />
                Last Result
              </h3>
              {!lastResult ? (
                <div className="text-center py-12 text-slate-400">
                  <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No results yet</p>
                  <p className="text-base">Play a game to see results</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${lastResult.payout > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {lastResult.payout > 0 ? '+' : ''}${lastResult.payout}
                    </div>
                    <div className="text-lg text-slate-300">
                      {lastResult.matches} matches out of {selectedNumbers.length}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-base font-semibold text-slate-300 mb-3">Drawn Numbers:</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {lastResult.drawnNumbers.map((num, index) => (
                        <div
                          key={index}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            selectedNumbers.includes(num)
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-600 text-slate-300'
                          }`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center - Game Board */}
          <div className="col-span-6 flex justify-center mb-20">
            <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-3xl p-16 shadow-2xl">
              <div className="grid grid-cols-10 gap-6 mb-10">
                {Array.from({ length: 80 }, (_, i) => i + 1).map((number) => {
                  const isSelected = selectedNumbers.includes(number);
                  const isDrawn = drawnNumbers.includes(number) || currentlyDrawing.includes(number);
                  const isCurrentlyBeingDrawn = currentlyDrawing.includes(number) && !drawnNumbers.includes(number);
                  const isMatch = isSelected && isDrawn;
                  const isHighlighted = highlightedNumber === number;
                  
                  return (
                    <button
                      key={number}
                      onClick={() => toggleNumber(number)}
                      disabled={isDrawing}
                      className={`
                        w-12 h-12 rounded-full font-bold text-sm transition-all duration-300 transform active:scale-95 shadow-lg
                        ${isHighlighted ? 'animate-pulse scale-125 ring-4 ring-white/50' : ''}
                        ${isCurrentlyBeingDrawn
                          ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-orange-500/50 animate-bounce'
                          : isMatch 
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-green-500/50 animate-pulse' 
                          : isSelected 
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/50' 
                            : isDrawn 
                              ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-900 shadow-yellow-500/50'
                              : 'bg-gradient-to-br from-slate-600/20 to-slate-700/20 hover:from-slate-500/30 hover:to-slate-600/30 text-white'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                      `}
                    >
                      {number}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={resetGame}
                  disabled={isDrawing}
                  className="p-5 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
                >
                  <RefreshCw className="w-8 h-8 text-slate-200" />
                </button>

                <button
                  onClick={drawNumbers}
                  disabled={selectedNumbers.length === 0 || balance < bet || isDrawing}
                  className="px-16 py-5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold text-xl rounded-xl transition-all duration-300 flex items-center gap-4 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                >
                  {isDrawing ? (
                    <>
                      <RefreshCw className="w-7 h-7 animate-spin" />
                      Drawing...
                    </>
                  ) : (
                    <>
                      <Play className="w-7 h-7" />
                      Draw Numbers
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Payout Table */}
          <div className="col-span-3">
            <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-purple-300" />
                Payout Table
              </h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {selectedNumbers.length === 0 ? (
                  <>
                    <div className="text-center py-6 text-slate-400 border-b border-slate-600 mb-4">
                      <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-base">Select numbers to see payouts</p>
                      <p className="text-sm">Choose 1-10 numbers to play</p>
                    </div>
                    {/* Show placeholder payout rows */}
                    {Array.from({ length: 8 }, (_, i) => (
                      <div
                        key={i}
                        className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 opacity-40"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-base text-slate-500">- matches</span>
                          <span className="font-bold text-lg text-slate-500">$-</span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  getPayoutTable().map(({ matches, payout }) => (
                    <div
                      key={matches}
                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-600"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-base text-slate-300">{matches} matches</span>
                        <span className="font-bold text-lg text-green-400">${payout.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Game Board */}
        <div className="md:hidden flex-1 flex flex-col justify-center px-2 pb-32">
          <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-2xl p-3 shadow-2xl mx-auto w-full max-w-sm">
            <div className="grid grid-cols-8 gap-1.5 mb-4">
              {Array.from({ length: 80 }, (_, i) => i + 1).map((number) => {
                const isSelected = selectedNumbers.includes(number);
                const isDrawn = drawnNumbers.includes(number) || currentlyDrawing.includes(number);
                const isCurrentlyBeingDrawn = currentlyDrawing.includes(number) && !drawnNumbers.includes(number);
                const isMatch = isSelected && isDrawn;
                const isHighlighted = highlightedNumber === number;
                
                return (
                  <button
                    key={number}
                    onClick={() => toggleNumber(number)}
                    disabled={isDrawing}
                    className={`
                      w-10 h-10 rounded-full font-bold text-xs transition-all duration-300 transform active:scale-95 shadow-lg
                      ${isHighlighted ? 'animate-pulse scale-110 ring-2 ring-white/50' : ''}
                      ${isCurrentlyBeingDrawn
                        ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-orange-500/50 animate-bounce'
                        : isMatch 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-green-500/50 animate-pulse' 
                        : isSelected 
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/50' 
                          : isDrawn 
                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-900 shadow-yellow-500/50'
                            : 'bg-gradient-to-br from-slate-600/20 to-slate-700/20 active:from-slate-500/30 active:to-slate-600/30 text-white'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {number}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={resetGame}
                disabled={isDrawing}
                className="p-5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
              >
                <RefreshCw className="w-5 h-5 text-slate-200" />
              </button>

              <button
                onClick={drawNumbers}
                disabled={selectedNumbers.length === 0 || balance < bet || isDrawing}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 active:from-purple-400 active:to-purple-500 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold text-sm rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg"
              >
                {isDrawing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Drawing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Draw Numbers
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { DollarSign, Target, TrendingUp, Users, Info, Calculator } from 'lucide-react';

interface BottomNavBarProps {
  balance: number;
  bet: number;
  setBet: (bet: number) => void;
  selectedNumbers: number[];
  isDrawing: boolean;
  onShowInfo: () => void;
  onShowPayoutLegend: () => void;
}

export default function BottomNavBar({ 
  balance, 
  bet, 
  setBet, 
  selectedNumbers, 
  isDrawing,
  onShowInfo,
  onShowPayoutLegend
}: BottomNavBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-lg border-t border-white/20 py-1 md:py-2 lg:py-4 px-2 md:px-4 lg:px-6 z-20">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center items-center gap-2 lg:gap-4">
          {/* Balance Display */}
          <div className="flex items-center gap-1 lg:gap-2 xl:gap-3 bg-gradient-to-r from-purple-900/20 to-black/40 backdrop-blur-sm border border-purple-400/20 px-2 lg:px-3 xl:px-4 py-1 lg:py-2 xl:py-3 rounded-md lg:rounded-lg xl:rounded-xl shadow-lg shadow-purple-500/10 min-w-[100px] lg:min-w-[120px] xl:min-w-[140px] hover:border-purple-400/30 transition-all duration-300">
            <DollarSign className="w-3 lg:w-4 xl:w-5 h-3 lg:h-4 xl:h-5 text-purple-200" />
            <div className="text-white">
              <div className="text-xs font-medium text-purple-100/80">Balance</div>
              <div className="text-sm lg:text-base font-bold">${balance.toLocaleString()}</div>
            </div>
          </div>

          {/* Bet Amount */}
          <div className="flex items-center gap-1 lg:gap-2 xl:gap-3 bg-gradient-to-r from-purple-900/20 to-black/40 backdrop-blur-sm border border-purple-400/20 px-2 lg:px-3 xl:px-4 py-1 lg:py-2 xl:py-3 rounded-md lg:rounded-lg xl:rounded-xl shadow-lg shadow-purple-500/10 min-w-[100px] lg:min-w-[120px] xl:min-w-[140px] hover:border-purple-400/30 transition-all duration-300">
            <TrendingUp className="w-3 lg:w-4 xl:w-5 h-3 lg:h-4 xl:h-5 text-purple-200" />
            <div className="text-white">
              <div className="text-xs font-medium text-purple-100/80">Bet</div>
              <input
                type="number"
                value={bet}
                onChange={(e) => setBet(Math.max(1, Math.min(balance, parseInt(e.target.value) || 1)))}
                className="w-8 lg:w-10 xl:w-12 px-1 py-1 rounded bg-purple-900/20 text-white font-bold text-xs border border-purple-400/30 focus:border-purple-300/60 focus:bg-purple-800/30 focus:outline-none transition-all"
                min="1"
                max={balance}
                disabled={isDrawing}
              />
            </div>
          </div>

          {/* Selected Numbers */}
          <div className="flex items-center gap-1 lg:gap-2 xl:gap-3 bg-gradient-to-r from-purple-900/20 to-black/40 backdrop-blur-sm border border-purple-400/20 px-2 lg:px-3 xl:px-4 py-1 lg:py-2 xl:py-3 rounded-md lg:rounded-lg xl:rounded-xl shadow-lg shadow-purple-500/10 min-w-[100px] lg:min-w-[120px] xl:min-w-[140px] hover:border-purple-400/30 transition-all duration-300">
            <Target className="w-3 lg:w-4 xl:w-5 h-3 lg:h-4 xl:h-5 text-purple-200" />
            <div className="text-white">
              <div className="text-xs font-medium text-purple-100/80">Selected</div>
              <div className="text-sm lg:text-base font-bold">{selectedNumbers.length}/10</div>
            </div>
          </div>

          {/* Quick Bet Buttons */}
          <div className="flex items-center gap-1 lg:gap-2 xl:gap-3 bg-gradient-to-r from-purple-900/20 to-black/40 backdrop-blur-sm border border-purple-400/20 px-2 lg:px-3 xl:px-4 py-1 lg:py-2 xl:py-3 rounded-md lg:rounded-lg xl:rounded-xl shadow-lg shadow-purple-500/10 min-w-[160px] lg:min-w-[200px] xl:min-w-[240px] hover:border-purple-400/30 transition-all duration-300">
            <div className="text-purple-100/80 text-xs font-medium">Quick:</div>
            <div className="flex gap-1 lg:gap-2">
              {[5, 10, 25, 50, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBet(Math.min(balance, amount))}
                  disabled={isDrawing || balance < amount}
                  className="px-1 lg:px-2 py-1 bg-purple-800/25 hover:bg-purple-700/40 disabled:bg-gray-600/50 text-white font-bold text-xs rounded border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 hover:shadow-purple-500/20 hover:shadow-md"
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Game Stats */}
          <div className="flex items-center gap-1 lg:gap-2 xl:gap-3 bg-gradient-to-r from-purple-900/20 to-black/40 backdrop-blur-sm border border-purple-400/20 px-2 lg:px-3 xl:px-4 py-1 lg:py-2 xl:py-3 rounded-md lg:rounded-lg xl:rounded-xl shadow-lg shadow-purple-500/10 min-w-[100px] lg:min-w-[120px] xl:min-w-[140px] hover:border-purple-400/30 transition-all duration-300">
            <Users className="w-3 lg:w-4 xl:w-5 h-3 lg:h-4 xl:h-5 text-purple-200" />
            <div className="text-white">
              <div className="text-xs font-medium text-purple-100/80">Max Win</div>
              <div className="text-sm lg:text-base font-bold">
                ${selectedNumbers.length > 0 ? (bet * 50).toLocaleString() : '0'}
              </div>
            </div>
          </div>

          {/* Info Button */}
          <button
            onClick={onShowInfo}
            className="flex items-center justify-center bg-gradient-to-r from-purple-900/20 to-black/40 backdrop-blur-sm border border-purple-400/20 p-2 lg:p-3 xl:p-4 rounded-md lg:rounded-lg xl:rounded-xl shadow-lg shadow-purple-500/10 hover:bg-purple-800/25 hover:border-purple-400/40 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/20"
            title="How to Play"
          >
            <Info className="w-3 lg:w-4 xl:w-5 h-3 lg:h-4 xl:h-5 text-purple-200" />
          </button>

          {/* Payout Legend Button */}
          <button
            onClick={onShowPayoutLegend}
            className="flex items-center justify-center bg-gradient-to-r from-purple-900/20 to-black/40 backdrop-blur-sm border border-purple-400/20 p-2 lg:p-3 xl:p-4 rounded-md lg:rounded-lg xl:rounded-xl shadow-lg shadow-purple-500/10 hover:bg-purple-800/25 hover:border-purple-400/40 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/20"
            title="Payout Legend"
          >
            <Calculator className="w-3 lg:w-4 xl:w-5 h-3 lg:h-4 xl:h-5 text-purple-200" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden space-y-2">
          {/* First Row */}
          <div className="flex justify-center items-center gap-2">
            {/* Balance */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900/20 to-black/40 backdrop-blur-sm border border-purple-400/20 px-3 py-2 rounded-lg shadow-lg shadow-purple-500/10 flex-1">
              <DollarSign className="w-4 h-4 text-purple-200" />
              <div className="text-white">
                <div className="text-xs text-purple-100/80">Balance</div>
                <div className="text-xs font-bold">${balance.toLocaleString()}</div>
              </div>
            </div>

            {/* Bet Amount */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900/20 to-black/40 backdrop-blur-sm border border-purple-400/20 px-3 py-2 rounded-lg shadow-lg shadow-purple-500/10 flex-1">
              <TrendingUp className="w-4 h-4 text-purple-200" />
              <div className="text-white">
                <div className="text-xs text-purple-100/80">Bet</div>
                <input
                  type="number"
                  value={bet}
                  onChange={(e) => setBet(Math.max(1, Math.min(balance, parseInt(e.target.value) || 1)))}
                  className="w-12 px-1 py-1 rounded bg-purple-900/20 text-white font-bold text-xs border border-purple-400/30 focus:border-purple-300/60 focus:bg-purple-800/30 focus:outline-none transition-all"
                  min="1"
                  max={balance}
                  disabled={isDrawing}
                />
              </div>
            </div>

            {/* Selected Numbers */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900/20 to-black/40 backdrop-blur-sm border border-purple-400/20 px-3 py-2 rounded-lg shadow-lg shadow-purple-500/10 flex-1">
              <Target className="w-4 h-4 text-purple-200" />
              <div className="text-white">
                <div className="text-xs text-purple-100/80">Selected</div>
                <div className="text-xs font-bold">{selectedNumbers.length}/10</div>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="flex justify-center items-center gap-2">
            {/* Max Win */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900/20 to-black/40 backdrop-blur-sm border border-purple-400/20 px-3 py-2 rounded-lg shadow-lg shadow-purple-500/10 flex-1">
              <Users className="w-4 h-4 text-purple-200" />
              <div className="text-white">
                <div className="text-xs text-purple-100/80">Max Win</div>
                <div className="text-xs font-bold">
                  ${selectedNumbers.length > 0 ? (bet * 50).toLocaleString() : '0'}
                </div>
              </div>
            </div>

            {/* Quick Bet Buttons */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900/20 to-black/40 backdrop-blur-sm border border-purple-400/20 px-3 py-2 rounded-lg shadow-lg shadow-purple-500/10 flex-1">
              <div className="text-purple-100/80 text-xs">Quick:</div>
              <div className="flex gap-1">
                {[10, 25, 50].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBet(Math.min(balance, amount))}
                    disabled={isDrawing || balance < amount}
                    className="px-2 py-1 bg-purple-800/25 active:bg-purple-700/40 disabled:bg-gray-600/50 text-white font-bold text-xs rounded border border-purple-500/20 active:border-purple-400/40 transition-all disabled:opacity-50"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Button */}
            <button
              onClick={onShowInfo}
              className="flex items-center justify-center bg-gradient-to-r from-purple-900/20 to-black/40 backdrop-blur-sm border border-purple-400/20 p-3 rounded-lg shadow-lg shadow-purple-500/10 active:bg-purple-800/25 active:border-purple-400/40 transition-all"
              title="How to Play"
            >
              <Info className="w-4 h-4 text-purple-200" />
            </button>

            {/* Payout Legend Button */}
            <button
              onClick={onShowPayoutLegend}
              className="flex items-center justify-center bg-gradient-to-r from-purple-900/20 to-black/40 backdrop-blur-sm border border-purple-400/20 p-3 rounded-lg shadow-lg shadow-purple-500/10 active:bg-purple-800/25 active:border-purple-400/40 transition-all"
              title="Payout Legend"
            >
              <Calculator className="w-4 h-4 text-purple-200" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
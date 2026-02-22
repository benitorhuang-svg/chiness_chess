import '../lib/engine/board.dart';
import '../lib/engine/models.dart';

void main() {
  print('--- 中國象棋引擎 啟動中 ---');
  final board = Board.initial();
  
  printBoard(board);
  
  print('\n[系統] 引擎初始化完成。');
  print('[提示] 您可以透過此引擎進行走法驗證與邏輯測試。');
}

void printBoard(Board board) {
  for (int y = 0; y <= 9; y++) {
    var row = '';
    for (int x = 0; x <= 8; x++) {
      final piece = board.getPieceAt(Position(x, y));
      if (piece == null) {
        row += ' ＋ ';
      } else {
        row += ' ${piece.name} ';
      }
    }
    print(row);
    if (y == 4) {
      print(' ～～～ 楚 河 漢 界 ～～～ ');
    }
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/game_provider.dart';
import '../engine/models.dart';
import 'board_painter.dart';
import 'piece_widget.dart';

class GamePage extends ConsumerStatefulWidget {
  const GamePage({Key? key}) : super(key: key);

  @override
  ConsumerState<GamePage> createState() => _GamePageState();
}

class _GamePageState extends ConsumerState<GamePage> {
  Position? selectedPosition;

  @override
  Widget build(BuildContext context) {
    final gameState = ref.watch(gameStateProvider);
    final board = gameState.board;

    return Scaffold(
      appBar: AppBar(
        title: const Text('中國象棋 PWA'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(gameStateProvider.notifier).reset(),
          ),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: AspectRatio(
            aspectRatio: 9 / 10,
            child: Stack(
              children: [
                // Board Lines
                CustomPaint(
                  painter: ChessBoardPainter(),
                  size: Size.infinite,
                ),
                // Tap areas and Pieces
                LayoutBuilder(
                  builder: (context, constraints) {
                    final cellWidth = constraints.maxWidth / 8;
                    final cellHeight = constraints.maxHeight / 9;

                    List<Widget> children = [];

                    // Draw Pieces and Tap targets
                    for (int x = 0; x < 9; x++) {
                      for (int y = 0; y < 10; y++) {
                        final pos = Position(x, y);
                        final piece = board.getPieceAt(pos);

                        children.add(
                          Positioned(
                            left: x * cellWidth - cellWidth / 2 + cellWidth / 2, // Center on intersection
                            top: y * cellHeight - cellHeight / 2 + cellHeight / 2, // Center on intersection
                            width: cellWidth,
                            height: cellHeight,
                            child: _buildInteractionCell(pos, piece, cellWidth),
                          ),
                        );

                        if (piece != null) {
                          children.add(
                            AnimatedPositioned(
                              duration: const Duration(milliseconds: 300),
                              curve: Curves.easeInOut,
                              left: x * cellWidth - (cellWidth * 0.4),
                              top: y * cellHeight - (cellHeight * 0.4),
                              width: cellWidth * 0.8,
                              height: cellHeight * 0.8,
                              child: PieceWidget(
                                piece: piece,
                                isSelected: selectedPosition == pos,
                                onTap: () => _handleTap(pos, piece),
                              ),
                            ),
                          );
                        }
                      }
                    }
                    return Stack(children: children);
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInteractionCell(Position pos, Piece? piece, double size) {
    return GestureDetector(
      onTap: () => _handleTap(pos, piece),
      child: Container(
        color: Colors.transparent, // Invisible tap target
        child: Center(
          child: selectedPosition != null && piece == null
              ? Container(
                  width: 10,
                  height: 10,
                  decoration: const BoxDecoration(
                    color: Colors.blueAccent,
                    shape: BoxShape.circle,
                  ),
                )
              : null,
        ),
      ),
    );
  }

  void _handleTap(Position pos, Piece? piece) {
    if (selectedPosition == null) {
      if (piece != null && piece.color == ref.read(gameStateProvider).turn) {
        setState(() {
          selectedPosition = pos;
        });
      }
    } else {
      if (selectedPosition == pos) {
        setState(() {
          selectedPosition = null;
        });
      } else {
        // Try to move
        ref.read(gameStateProvider.notifier).makeMove(selectedPosition!, pos);
        setState(() {
          selectedPosition = null;
        });
      }
    }
  }
}

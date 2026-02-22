import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../engine/game_state.dart';
import '../engine/models.dart';

final gameStateProvider = StateNotifierProvider<GameStateNotifier, GameState>((ref) {
  return GameStateNotifier();
});

class GameStateNotifier extends StateNotifier<GameState> {
  GameStateNotifier() : super(GameState.initial());

  void makeMove(Position from, Position to) {
    state = state.makeMove(from, to);
  }

  void reset() {
    state = GameState.initial();
  }
}

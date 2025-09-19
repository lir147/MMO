import math

def exp_to_next(level:int)->int:
    return int(100 * (level ** 1.5))

def calc_damage(attacker_atk:int, skill_mult:float, defender_def:int, critical:bool=False):
    base = max(1, int(attacker_atk * skill_mult - defender_def))
    if critical:
        base = int(base * 1.5)
    return max(1, base)

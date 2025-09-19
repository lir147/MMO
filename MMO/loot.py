
import random
from items import Weapon, Armor

class LootTable:
    def __init__(self):
        self.items = []

    def add_item(self, item, drop_chance):
        self.items.append((item, drop_chance))

    def get_random_item(self):
        total_chance = sum(chance for _, chance in self.items)
        random_choice = random.randint(1, total_chance)
        current_chance = 0
        for item, chance in self.items:
            current_chance += chance
            if random_choice <= current_chance:
                return item
        return None

loot_table = LootTable()
loot_table.add_item(Weapon("Sword of Power", 50), 10)
loot_table.add_item(Armor("Shield of Valor", 30), 20)
loot_table.add_item(Weapon("Dagger of Stealth", 25), 30)

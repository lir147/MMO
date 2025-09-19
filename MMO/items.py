
class Item:
    def __init__(self, name, item_type, stat_bonus):
        self.name = name
        self.item_type = item_type
        self.stat_bonus = stat_bonus

class Weapon(Item):
    def __init__(self, name, damage):
        super().__init__(name, item_type="weapon", stat_bonus={"damage": damage})

class Armor(Item):
    def __init__(self, name, defense):
        super().__init__(name, item_type="armor", stat_bonus={"defense": defense})

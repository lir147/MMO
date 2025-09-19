class Character:
    def __init__(self, name, health, mana, strength, agility, intelligence):
        self.name = name
        self.health = health
        self.mana = mana
        self.strength = strength
        self.agility = agility
        self.intelligence = intelligence
        self.inventory = []

class Warrior(Character):
    def __init__(self, name):
        super().__init__(name, health=120, mana=30, strength=20, agility=10, intelligence=5)

class Mage(Character):
    def __init__(self, name):
        super().__init__(name, health=60, mana=100, strength=5, agility=10, intelligence=20)

class Archer(Character):
    def __init__(self, name):
        # Лёгкий, быстрый класс с высокой ловкостью
        super().__init__(name, health=80, mana=50, strength=10, agility=20, intelligence=10)

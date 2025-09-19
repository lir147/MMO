from sqlalchemy import Column, Integer, String, BigInteger, Boolean, JSON, DateTime, ForeignKey, func
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(BigInteger, primary_key=True)
    username = Column(String)
    display_name = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    gold = Column(Integer, default=0)
    premium_until = Column(DateTime, nullable=True)
    char = relationship('Char', back_populates='user', uselist=False)

class Char(Base):
    __tablename__ = 'chars'
    id = Column(Integer, primary_key=True)
    user_id = Column(BigInteger, ForeignKey('users.id'))
    name = Column(String)
    class_slug = Column(String)
    level = Column(Integer, default=1)
    exp = Column(Integer, default=0)
    hp = Column(Integer, default=100)
    mp = Column(Integer, default=50)
    atk = Column(Integer, default=10)
    defn = Column(Integer, default=5)
    skills = Column(JSON, default=list)
    equipped = Column(JSON, default=dict)
    user = relationship('User', back_populates='char')

class Item(Base):
    __tablename__ = 'items'
    id = Column(Integer, primary_key=True)
    slug = Column(String, unique=True)
    name = Column(String)
    type = Column(String)
    rarity = Column(String)
    stats = Column(JSON, default=dict)
    tradable = Column(Boolean, default=True)
    price = Column(Integer, default=0)

class Inventory(Base):
    __tablename__ = 'inventory'
    id = Column(Integer, primary_key=True)
    char_id = Column(Integer, ForeignKey('chars.id'))
    item_id = Column(Integer, ForeignKey('items.id'))
    qty = Column(Integer, default=1)

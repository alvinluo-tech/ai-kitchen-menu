-- 示例食材数据
insert into public.ingredients (name, category) values
('土豆', 'vegetable'),
('牛肉', 'meat'),
('鸡蛋', 'egg'),
('番茄', 'vegetable'),
('洋葱', 'vegetable'),
('青椒', 'vegetable'),
('大蒜', 'seasoning'),
('米饭', 'staple'),
('面条', 'staple'),
('豆腐', 'vegetable'),
('猪肉', 'meat'),
('鸡肉', 'meat'),
('虾', 'seafood'),
('白菜', 'vegetable'),
('胡萝卜', 'vegetable')
on conflict (name) do nothing;

-- 示例菜品数据
insert into public.dishes (
  name,
  slug,
  description,
  story,
  image_url,
  cuisine,
  spice_level,
  difficulty,
  cooking_time_minutes,
  servings,
  is_available
) values
(
  '香辣土豆牛肉',
  'spicy-potato-beef',
  '微辣、下饭、适合配米饭的一道家常菜。',
  '这道菜是朋友很常做的一道菜，土豆吸满汤汁以后特别适合拌饭。',
  null,
  '家常',
  2,
  'medium',
  40,
  2,
  true
),
(
  '番茄炒蛋',
  'tomato-egg',
  '酸甜、快手、适合不知道吃什么的时候。',
  '这是最不容易出错的一道菜，简单但很有家的感觉。',
  null,
  '家常',
  0,
  'easy',
  15,
  2,
  true
),
(
  '酸辣土豆丝',
  'sour-spicy-potato',
  '酸辣、清爽、快手、很下饭。',
  '这道菜适合想吃开胃一点但又不想太复杂的时候。',
  null,
  '家常',
  2,
  'easy',
  15,
  2,
  true
),
(
  '蒜蓉炒白菜',
  'garlic-bok-choy',
  '清淡、健康、适合想吃点蔬菜的时候。',
  '最简单的家常菜，蒜香扑鼻，白菜清甜。',
  null,
  '家常',
  0,
  'easy',
  10,
  2,
  true
),
(
  '麻婆豆腐',
  'mapo-tofu',
  '麻辣、下饭、川菜经典。',
  '朋友从四川学来的做法，麻婆豆腐就是要够麻够辣。',
  null,
  '川菜',
  4,
  'medium',
  25,
  2,
  true
);

-- 示例菜品-食材关联
-- 香辣土豆牛肉
insert into public.dish_ingredients (dish_id, ingredient_id, amount, is_required)
select d.id, i.id, '2个', true
from public.dishes d, public.ingredients i
where d.slug = 'spicy-potato-beef' and i.name = '土豆';

insert into public.dish_ingredients (dish_id, ingredient_id, amount, is_required)
select d.id, i.id, '300g', true
from public.dishes d, public.ingredients i
where d.slug = 'spicy-potato-beef' and i.name = '牛肉';

insert into public.dish_ingredients (dish_id, ingredient_id, amount, is_required)
select d.id, i.id, '3瓣', false
from public.dishes d, public.ingredients i
where d.slug = 'spicy-potato-beef' and i.name = '大蒜';

-- 番茄炒蛋
insert into public.dish_ingredients (dish_id, ingredient_id, amount, is_required)
select d.id, i.id, '2个', true
from public.dishes d, public.ingredients i
where d.slug = 'tomato-egg' and i.name = '番茄';

insert into public.dish_ingredients (dish_id, ingredient_id, amount, is_required)
select d.id, i.id, '3个', true
from public.dishes d, public.ingredients i
where d.slug = 'tomato-egg' and i.name = '鸡蛋';

-- 酸辣土豆丝
insert into public.dish_ingredients (dish_id, ingredient_id, amount, is_required)
select d.id, i.id, '2个', true
from public.dishes d, public.ingredients i
where d.slug = 'sour-spicy-potato' and i.name = '土豆';

-- 蒜蓉炒白菜
insert into public.dish_ingredients (dish_id, ingredient_id, amount, is_required)
select d.id, i.id, '半颗', true
from public.dishes d, public.ingredients i
where d.slug = 'garlic-bok-choy' and i.name = '白菜';

insert into public.dish_ingredients (dish_id, ingredient_id, amount, is_required)
select d.id, i.id, '3瓣', true
from public.dishes d, public.ingredients i
where d.slug = 'garlic-bok-choy' and i.name = '大蒜';

-- 麻婆豆腐
insert into public.dish_ingredients (dish_id, ingredient_id, amount, is_required)
select d.id, i.id, '1块', true
from public.dishes d, public.ingredients i
where d.slug = 'mapo-tofu' and i.name = '豆腐';

insert into public.dish_ingredients (dish_id, ingredient_id, amount, is_required)
select d.id, i.id, '100g', false
from public.dishes d, public.ingredients i
where d.slug = 'mapo-tofu' and i.name = '猪肉';

-- 示例标签
insert into public.dish_tags (dish_id, tag)
select id, '下饭' from public.dishes where slug = 'spicy-potato-beef';

insert into public.dish_tags (dish_id, tag)
select id, '微辣' from public.dishes where slug = 'spicy-potato-beef';

insert into public.dish_tags (dish_id, tag)
select id, '家常' from public.dishes where slug = 'spicy-potato-beef';

insert into public.dish_tags (dish_id, tag)
select id, '快手' from public.dishes where slug = 'tomato-egg';

insert into public.dish_tags (dish_id, tag)
select id, '酸甜' from public.dishes where slug = 'tomato-egg';

insert into public.dish_tags (dish_id, tag)
select id, '简单' from public.dishes where slug = 'tomato-egg';

insert into public.dish_tags (dish_id, tag)
select id, '酸辣' from public.dishes where slug = 'sour-spicy-potato';

insert into public.dish_tags (dish_id, tag)
select id, '快手' from public.dishes where slug = 'sour-spicy-potato';

insert into public.dish_tags (dish_id, tag)
select id, '开胃' from public.dishes where slug = 'sour-spicy-potato';

insert into public.dish_tags (dish_id, tag)
select id, '清淡' from public.dishes where slug = 'garlic-bok-choy';

insert into public.dish_tags (dish_id, tag)
select id, '健康' from public.dishes where slug = 'garlic-bok-choy';

insert into public.dish_tags (dish_id, tag)
select id, '蔬菜' from public.dishes where slug = 'garlic-bok-choy';

insert into public.dish_tags (dish_id, tag)
select id, '麻辣' from public.dishes where slug = 'mapo-tofu';

insert into public.dish_tags (dish_id, tag)
select id, '下饭' from public.dishes where slug = 'mapo-tofu';

insert into public.dish_tags (dish_id, tag)
select id, '川菜' from public.dishes where slug = 'mapo-tofu';

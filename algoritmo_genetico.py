import random

def crear_individuo(n):
    return [random.randint(0, n-1) for _ in range(n)]

def fitness(individuo):
    conflictos = 0
    n = len(individuo)

    for i in range(n):
        for j in range(i+1, n):
            if individuo[i] == individuo[j] or abs(individuo[i] - individuo[j]) == abs(i - j):
                conflictos += 1

    return 1 / (1 + conflictos)

def seleccion_torneo(poblacion):
    a = random.choice(poblacion)
    b = random.choice(poblacion)
    return a if fitness(a) > fitness(b) else b

def seleccion_ruleta(poblacion):
    total = sum(fitness(i) for i in poblacion)
    pick = random.uniform(0, total)
    current = 0

    for individuo in poblacion:
        current += fitness(individuo)
        if current > pick:
            return individuo

def cruce(p1, p2):
    punto = random.randint(1, len(p1)-2)
    return p1[:punto] + p2[punto:]

def mutacion(individuo, tasa):
    if random.random() < tasa:
        i = random.randint(0, len(individuo)-1)
        individuo[i] = random.randint(0, len(individuo)-1)
    return individuo

def ejecutar(n, tam_pob, generaciones, tasa_mut, metodo):

    poblacion = [crear_individuo(n) for _ in range(tam_pob)]
    historial = []

    for _ in range(generaciones):

        poblacion = sorted(poblacion, key=fitness, reverse=True)
        historial.append(fitness(poblacion[0]))

        nueva = []

        for _ in range(tam_pob):
            if metodo == "torneo":
                p1 = seleccion_torneo(poblacion)
                p2 = seleccion_torneo(poblacion)
            else:
                p1 = seleccion_ruleta(poblacion)
                p2 = seleccion_ruleta(poblacion)

            hijo = cruce(p1, p2)
            hijo = mutacion(hijo, tasa_mut)
            nueva.append(hijo)

        poblacion = nueva

    mejor = max(poblacion, key=fitness)
    return mejor, historial
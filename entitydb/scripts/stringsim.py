#!/usr/bin/python

# String similarity


def _sim(a, b):
    if a == b:
        return 10
    elif a.lower() == b.lower():
        return 5
    else:
        return -10


def needlemanwunsch(A, B, gap_penalty = -5):
    rows = len(A) + 1
    cols = len(B) + 1

    F = [[0] * cols for i in range(rows)]
    #F = numpy.zeros((rows, cols), int)

    for i in range(rows):
        F[i][0] = i * gap_penalty
    for j in range(cols):
        F[0][j] = j * gap_penalty

    for i in range(1, rows):
        for j in range(1, cols):
            match = F[i-1][j-1] + _sim(A[i-1], B[j-1])
            delete = F[i-1][j] + gap_penalty
            insert = F[i][j-1] + gap_penalty
            F[i][j] = max(match, delete, insert)

    i = rows - 1
    j = cols - 1
    alignA, alignB = [], []
    while i > 0 and j > 0:
        if F[i][j] == F[i-1][j-1] + _sim(A[i-1], B[j-1]):
            # match
            alignA.insert(0, A[i-1])
            alignB.insert(0, B[j-1])
            i -= 1
            j -= 1
        elif F[i][j] == F[i-1][j] + gap_penalty:
            # delete
            alignA.insert(0, A[i-1])
            alignB.insert(0, None)
            i -= 1
        elif F[i][j] == F[i][j-1] + gap_penalty:
            # insert
            alignA.insert(0, None)
            alignB.insert(0, B[j-1])
            j -= 1
        else:
            assert False, 'internal error'

    while i > 0:
        alignA.insert(0, A[i-1])
        alignB.insert(0, None)
        i -= 1
    while j > 0:
        alignA.insert(0, None)
        alignB.insert(0, B[j-1])
        j -= 1

    # sanity
    assert A == ''.join([a for a in alignA if a is not None])
    assert B == ''.join([b for b in alignB if b is not None])

    return F[-1][-1]

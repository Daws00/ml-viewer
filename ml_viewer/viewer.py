from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort
import json
import numpy as np
import matplotlib.pyplot as plt

# from ml_viewer.auth import login_required
bp = Blueprint('viewer', __name__)

@bp.route('/')
def index():
    return render_template('viewer/index.html')

@bp.route('/test')
def test():
    return render_template('viewer/test.html')

@bp.route('/_gradient_descent', methods=['GET','POST'])
def _gradient_descent():
    data = request.json
    if(len(data['X']) <= 1):
        return jsonify({'error':'not enough data'});
    X = np.array([data['X']]).T
    y = np.array([data['Y']]).T
    theta_guess = np.array([data['theta']]).T
    alpha = data['alpha']
    num_iter = min(data['num_iter'],5000);

    tempX = X
    for i in range(1,data['poly']):
        temp = tempX;
        for j in range(i):
            temp = np.multiply(temp,tempX)
        X = np.hstack((X,temp))
    X, mu, sigma = feature_normalize(X)
    ones = np.ones((len(data['X']),1))
    X = np.hstack((ones,X))

    theta = gradient_descent(X,y,theta_guess,alpha,num_iter);
    return jsonify({'theta':theta.tolist(), 'sigma': sigma.tolist(), 'mu':mu.tolist()})

def gradient_descent(X, y, theta, alpha, num_iter):
    m = y.size
    for i in range(num_iter):
        h = X.dot(theta)
        loss = h - y
        gradient = np.dot(X.T, loss) / m
        theta = theta - alpha * gradient
    return theta

@bp.route('/_log_regress', methods=['GET','POST'])
def _log_regress():
    data = request.json
    if(len(data['X']) <= 1):
        return jsonify({'error':'not enough data'})
    X = np.array([data['X'][0]]).T
    for i in range(1, len(data['X'])):
        feature = np.array([data['X'][i]]).T
        X = np.hstack((X,feature))
    y = np.array([data['Y']]).T
    alpha = data['alpha']
    num_iter = min(data['num_iter'],5000);

    for i in range(X.shape[0]):
        Xi = X[i]
        for j in range(1,data['poly']):
            for k in range(j):
                Xi2 = np.multiply(Xi,Xi)
                X = np.hstack((X,Xi2))
    X, mu, sigma = feature_normalize(X)
    X = mapFeature(X[:,0],X[:,1])
    # ones = np.ones((X.shape[0],1))
    # X = np.hstack((ones,X))
    theta_guess = np.ones((X.shape[1],1))

    theta = log_regress(X,y,theta_guess,alpha,num_iter);
    hypothesis = computeBoundary(X,y,theta,mu,sigma)

    return jsonify({'theta':theta.tolist(), 'sigma': sigma.tolist(), 'mu':mu.tolist(), 'hypothesis':hypothesis.tolist()})

def log_regress(X,y,theta,alpha,num_iter):
    m = y.size
    h = 1 / (1 + np.exp(-(X.dot(theta))))
    loss = h - y
    gradient = np.dot(X.T, loss) / m
    theta = theta - alpha*gradient

    l = 0.1
    for i in range(1, num_iter):
        h = 1 / (1 + np.exp(-(X.dot(theta))))
        loss = h-y
        gradient = np.dot(X.T, loss)
        theta = theta * (1-alpha*l/m) - alpha * gradient / m
    return theta

def computeBoundary(X,y,theta,mu,sigma):
    u = np.linspace(0,1000,50)
    v = np.linspace(0,1000,50)

    z = np.zeros((u.size, v.size))

    c = []
    test = mapFeature((u[5]-mu[0])/sigma[0],(v[5]-mu[1])/sigma[1]).dot(theta)
    print(test)
    for i in range(u.size):
        for j in range(v.size):
            z[i,j] = mapFeature((u[i]-mu[0])/sigma[0],(v[j]-mu[1])/sigma[1]).dot(theta)
    return z;
    # plt.contour(u,v,z,[0])
    # plt.show()
    # print(c)

def connectLine(c):
    for i in range(len(c)):
        minDistance = distance(c[i],c[(i+1) % len(c)])
        c[i]['next'] = (i+1) % len(c)
        for j in range(len(c)):
            if i != j:
                dist = distance(c[i],c[j])
                if(dist < minDistance):
                    minDistance = dist
                    c[i]['next'] = j
    return c

def distance(a,b):
    return ((b['x']-a['x'])**2+(b['y']-a['y'])**2)**0.5

def mapFeature(X1,X2):
    degree = 6
    out = [np.ones(X1.size)]
    for i in range(1, degree+1):
        for j in range(i+1):
            out.append(X1 ** (i-j) * X2 ** j)

    if np.isscalar(X1):
        return np.hstack(out)  # if inputs are scalars, return a vector
    else:
        return np.column_stack(out)

def feature_normalize(X):
    X_norm = X;

    mu = np.mean(X, axis=0)
    sigma = np.std(X, axis=0)
    X_norm = (X_norm - mu) / sigma
    return (X_norm, mu, sigma)

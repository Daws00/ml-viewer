from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort
import json
import numpy as np

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
    num_iter = data['num_iter']

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
        gradient = np.dot(X.transpose(), loss) / m
        theta = theta - alpha * gradient
    return theta

def feature_normalize(X):
    X_norm = X;

    mu = np.mean(X, axis=0)
    sigma = np.std(X, axis=0)
    X_norm = (X_norm - mu) / sigma
    return (X_norm, mu, sigma)

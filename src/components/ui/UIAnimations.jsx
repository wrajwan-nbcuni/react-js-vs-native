import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { animated, config, useSpring } from 'react-spring';

const UIAnimations = () => {
	// React Spring example
	const [toggle, setToggle] = useState(false);

	const springProps = useSpring({
		scale: toggle ? 1.5 : 1,
		rotation: toggle ? 180 : 0,
		backgroundColor: toggle ? '#ff4081' : '#0070f3',
		config: { tension: 200, friction: 20 },
	});

	// Framer Motion example
	const [isOpen, setIsOpen] = useState(false);

	const variants = {
		closed: { height: '50px', overflow: 'hidden' },
		open: { height: 'auto' },
	};

	// Swipe example using manual tracking
	const [swipeDirection, setSwipeDirection] = useState('Swipe me');
	const [swipeStart, setSwipeStart] = useState(null);

	const handleSwipeStart = (e) => {
		// Get touch or mouse position
		const clientX = e.touches ? e.touches[0].clientX : e.clientX;
		setSwipeStart(clientX);
	};

	const handleSwipeEnd = (e) => {
		if (swipeStart === null) return;

		// Get touch or mouse position
		const clientX = e.changedTouches
			? e.changedTouches[0].clientX
			: e.clientX;
		const delta = clientX - swipeStart;

		if (delta > 50) {
			setSwipeDirection('Swiped right');
			if (vibrationSupported) navigator.vibrate(20);
		} else if (delta < -50) {
			setSwipeDirection('Swiped left');
			if (vibrationSupported) navigator.vibrate(20);
		}

		setSwipeStart(null);
	};

	// Pull to refresh simulation with manual events
	const [refreshing, setRefreshing] = useState(false);
	const [pullDistance, setPullDistance] = useState(0);
	const maxPullDistance = 100;
	const pullAreaRef = useRef(null);
	const pullStartY = useRef(null);
	const pullActive = useRef(false);

	const handlePullStart = (e) => {
		pullStartY.current = e.touches ? e.touches[0].clientY : e.clientY;
		pullActive.current = true;
	};

	const handlePullMove = (e) => {
		if (!pullActive.current || pullStartY.current === null) return;

		const clientY = e.touches ? e.touches[0].clientY : e.clientY;
		const delta = clientY - pullStartY.current;

		if (delta > 0) {
			setPullDistance(Math.min(delta, maxPullDistance));
			e.preventDefault(); // Prevent scroll
		}
	};

	const handlePullEnd = () => {
		if (pullDistance > maxPullDistance * 0.6) {
			// Trigger refresh
			setRefreshing(true);
			setTimeout(() => {
				setRefreshing(false);
				setPullDistance(0);
			}, 2000);
			if (vibrationSupported) navigator.vibrate([10, 30, 40]);
		} else {
			// Not pulled far enough
			setPullDistance(0);
		}

		pullActive.current = false;
		pullStartY.current = null;
	};

	// Animation sequence - simpler implementation without refs
	const [sequenceActive, setSequenceActive] = useState(false);
	const [sequenceStep, setSequenceStep] = useState(0);

	// Use useEffect hook properly
	useEffect(() => {
		let timer1, timer2, timer3;

		if (sequenceActive) {
			// Forward sequence
			timer1 = setTimeout(() => setSequenceStep(1), 0);
			timer2 = setTimeout(() => setSequenceStep(2), 500);
			timer3 = setTimeout(() => setSequenceStep(3), 1000);
		} else {
			// Reverse sequence
			timer1 = setTimeout(() => setSequenceStep(2), 0);
			timer2 = setTimeout(() => setSequenceStep(1), 500);
			timer3 = setTimeout(() => setSequenceStep(0), 1000);
		}

		// Cleanup function
		return () => {
			clearTimeout(timer1);
			clearTimeout(timer2);
			clearTimeout(timer3);
		};
	}, [sequenceActive]);

	// Individual springs without refs
	const firstSpring = useSpring({
		transform: sequenceStep >= 1 ? 'translateX(100px)' : 'translateX(0px)',
		config: config.wobbly,
	});

	const secondSpring = useSpring({
		transform: sequenceStep >= 2 ? 'scale(1.5)' : 'scale(1)',
		config: config.gentle,
	});

	const thirdSpring = useSpring({
		opacity: sequenceStep >= 3 ? 0.3 : 1,
		config: config.molasses,
	});

	// Drag with constraints using manual events
	const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
	const dragStartPos = useRef(null);
	const dragActive = useRef(false);

	const handleDragStart = (e) => {
		e.preventDefault();
		dragActive.current = true;

		// Get touch or mouse position
		const clientX = e.touches ? e.touches[0].clientX : e.clientX;
		const clientY = e.touches ? e.touches[0].clientY : e.clientY;

		dragStartPos.current = {
			mouseX: clientX,
			mouseY: clientY,
			startX: dragPosition.x,
			startY: dragPosition.y,
		};
	};

	const handleDragMove = (e) => {
		if (!dragActive.current || !dragStartPos.current) return;

		e.preventDefault();

		// Get touch or mouse position
		const clientX = e.touches ? e.touches[0].clientX : e.clientX;
		const clientY = e.touches ? e.touches[0].clientY : e.clientY;

		// Calculate new position
		const deltaX = clientX - dragStartPos.current.mouseX;
		const deltaY = clientY - dragStartPos.current.mouseY;

		const newX = dragStartPos.current.startX + deltaX;
		const newY = dragStartPos.current.startY + deltaY;

		// Apply constraints
		const constrainedX = Math.max(-100, Math.min(100, newX));
		const constrainedY = Math.max(-100, Math.min(100, newY));

		setDragPosition({ x: constrainedX, y: constrainedY });
	};

	const handleDragEnd = () => {
		dragActive.current = false;
		dragStartPos.current = null;
	};

	const resetDragPosition = () => {
		setDragPosition({ x: 0, y: 0 });
		if (vibrationSupported) navigator.vibrate(10);
	};

	// Card stack (Tinder-like)
	const [cards, setCards] = useState([
		{ id: 1, content: 'Card 1', color: '#ff4d4f' },
		{ id: 2, content: 'Card 2', color: '#ff7a45' },
		{ id: 3, content: 'Card 3', color: '#fa8c16' },
		{ id: 4, content: 'Card 4', color: '#faad14' },
	]);

	const removeCard = (id) => {
		setCards((cards) => cards.filter((card) => card.id !== id));
	};

	// Reset cards
	const resetCards = () => {
		setCards([
			{ id: 1, content: 'Card 1', color: '#ff4d4f' },
			{ id: 2, content: 'Card 2', color: '#ff7a45' },
			{ id: 3, content: 'Card 3', color: '#fa8c16' },
			{ id: 4, content: 'Card 4', color: '#faad14' },
		]);
		if (vibrationSupported) navigator.vibrate([40, 60, 40]);
	};

	return (
		<div>
			<h2>UI & Animation Capabilities</h2>
			<p>
				Modern web frameworks can implement many native-like UI
				interactions and animations, though there are performance
				considerations for complex animations.
			</p>

			<div className='card'>
				<div className='card-header'>
					<h3>React Spring Physics-Based Animations</h3>
				</div>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
					}}
				>
					<animated.div
						style={{
							width: '100px',
							height: '100px',
							borderRadius: '8px',
							backgroundColor: springProps.backgroundColor,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'white',
							transform: springProps.scale
								.to((s) => `scale(${s})`)
								.to(
									(s) =>
										`${s} rotate(${springProps.rotation.get()}deg)`
								),
						}}
					>
						Spring
					</animated.div>
					<button
						style={{ marginTop: '15px' }}
						onClick={() => {
							setToggle(!toggle);
							triggerHapticFeedback('medium');
						}}
					>
						{toggle ? 'Reset' : 'Animate'}
					</button>
				</div>
			</div>

			<div className='card'>
				<div className='card-header'>
					<h3>Framer Motion Layout Animations</h3>
				</div>
				<motion.div
					layout
					style={{
						backgroundColor: '#4caf50',
						color: 'white',
						borderRadius: '8px',
						padding: '10px',
						cursor: 'pointer',
					}}
					initial='closed'
					animate={isOpen ? 'open' : 'closed'}
					variants={variants}
					onClick={() => {
						setIsOpen(!isOpen);
						triggerHapticFeedback('light');
					}}
				>
					<motion.h4 layout>Expandable Card</motion.h4>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
						>
							<p>
								This content animates smoothly when the card
								expands and collapses.
							</p>
							<p>
								Framer Motion handles layout transitions
								automatically.
							</p>
						</motion.div>
					)}
				</motion.div>
			</div>

			<div className='card'>
				<div className='card-header'>
					<h3>Touch Gestures</h3>
				</div>
				<div
					style={{
						backgroundColor: '#ff9800',
						color: 'white',
						borderRadius: '8px',
						padding: '20px',
						marginBottom: '10px',
						textAlign: 'center',
						cursor: 'grab',
						userSelect: 'none',
					}}
					onMouseDown={handleSwipeStart}
					onMouseUp={handleSwipeEnd}
					onMouseLeave={handleSwipeEnd}
					onTouchStart={handleSwipeStart}
					onTouchEnd={handleSwipeEnd}
				>
					{swipeDirection}
				</div>
				<p>Swipe left or right to test swipe detection.</p>
			</div>

			<div className='card'>
				<div className='card-header'>
					<h3>Pull to Refresh Simulation</h3>
				</div>
				<div
					style={{
						position: 'relative',
						height: '200px',
						border: '1px dashed #eaeaea',
						borderRadius: '8px',
						overflow: 'hidden',
					}}
				>
					<div
						ref={pullAreaRef}
						onMouseDown={handlePullStart}
						onMouseMove={handlePullMove}
						onMouseUp={handlePullEnd}
						onMouseLeave={handlePullEnd}
						onTouchStart={handlePullStart}
						onTouchMove={handlePullMove}
						onTouchEnd={handlePullEnd}
						style={{
							height: '100%',
							backgroundColor: '#f5f5f5',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							transform: `translateY(${pullDistance}px)`,
							transition: !refreshing
								? 'transform 0.3s ease'
								: 'none',
							cursor: 'pointer',
							userSelect: 'none',
						}}
					>
						{refreshing ? (
							<div>
								<div
									style={{
										width: '30px',
										height: '30px',
										borderRadius: '50%',
										flexShrink: '0',
										border: '3px solid rgba(0, 112, 243, 0.2)',
										borderTopColor: '#0070f3',
										animation: 'spin 1s linear infinite',
										marginBottom: '10px',
									}}
								></div>
								<span>Refreshing...</span>
							</div>
						) : (
							<>
								<div
									style={{
										transform: `rotate(${Math.min(
											180,
											(pullDistance / maxPullDistance) *
												180
										)}deg)`,
										transition: 'transform 0.2s ease',
										marginBottom: '10px',
									}}
								>
									↓
								</div>
								<span>
									{pullDistance > maxPullDistance * 0.6
										? 'Release to refresh'
										: 'Pull down to refresh'}
								</span>
							</>
						)}
					</div>
				</div>
				<style>
					{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
				</style>
				<p style={{ marginTop: '10px' }}>
					This simulates the native "pull to refresh" gesture common
					in mobile apps. In React Native, this would use ScrollView's
					refreshControl prop.
				</p>
			</div>

			<div className='card'>
				<div className='card-header'>
					<h3>Animation Sequence</h3>
				</div>
				<div
					style={{
						height: '150px',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						gap: '20px',
					}}
				>
					<animated.div
						style={{
							...firstSpring,
							width: '50px',
							height: '50px',
							backgroundColor: '#1890ff',
							borderRadius: '8px',
						}}
					/>
					<animated.div
						style={{
							...secondSpring,
							width: '50px',
							height: '50px',
							backgroundColor: '#f759ab',
							borderRadius: '8px',
						}}
					/>
					<animated.div
						style={{
							...thirdSpring,
							width: '50px',
							height: '50px',
							backgroundColor: '#52c41a',
							borderRadius: '8px',
						}}
					/>
				</div>
				<div style={{ textAlign: 'center', marginTop: '10px' }}>
					<button
						onClick={() => {
							setSequenceActive(!sequenceActive);
							triggerHapticFeedback('success');
						}}
					>
						{sequenceActive ? 'Reset Sequence' : 'Play Sequence'}
					</button>
				</div>
				<p style={{ marginTop: '10px' }}>
					Chain animations to create complex sequences. React Native's
					Animated API provides similar functionality with its
					sequence and parallel methods.
				</p>
			</div>

			<div className='card'>
				<div className='card-header'>
					<h3>Constrained Drag</h3>
				</div>
				<div
					style={{
						position: 'relative',
						height: '250px',
						border: '1px dashed #eaeaea',
						borderRadius: '8px',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<div
						style={{
							width: '200px',
							height: '200px',
							border: '1px solid #eaeaea',
							borderRadius: '8px',
							position: 'relative',
						}}
					>
						<div
							onMouseDown={handleDragStart}
							onMouseMove={handleDragMove}
							onMouseUp={handleDragEnd}
							onMouseLeave={handleDragEnd}
							onTouchStart={handleDragStart}
							onTouchMove={handleDragMove}
							onTouchEnd={handleDragEnd}
							style={{
								width: '50px',
								height: '50px',
								backgroundColor: '#722ed1',
								borderRadius: '8px',
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: `translate(calc(-50% + ${dragPosition.x}px), calc(-50% + ${dragPosition.y}px))`,
								cursor: 'grab',
								userSelect: 'none',
								touchAction: 'none',
							}}
						/>
					</div>
				</div>
				<div style={{ textAlign: 'center', marginTop: '10px' }}>
					<button onClick={resetDragPosition}>Reset Position</button>
				</div>
				<p style={{ marginTop: '10px' }}>
					Drag the purple square within the container. The movement is
					constrained, similar to React Native's PanResponder with
					limits.
				</p>
			</div>

			<div className='card'>
				<div className='card-header'>
					<h3>Card Stack (Tinder-like)</h3>
				</div>
				<div
					style={{
						height: '300px',
						position: 'relative',
						margin: '20px 0',
					}}
				>
					<AnimatePresence>
						{cards.map((card, index) => (
							<motion.div
								key={card.id}
								style={{
									position: 'absolute',
									width: '250px',
									height: '150px',
									backgroundColor: card.color,
									borderRadius: '8px',
									padding: '20px',
									color: 'white',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									fontSize: '20px',
									fontWeight: 'bold',
									boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
									top: 0,
									left: '50%',
									zIndex: cards.length - index,
									cursor: 'grab',
								}}
								drag
								dragConstraints={{
									left: 0,
									right: 0,
									top: 0,
									bottom: 0,
								}}
								dragElastic={0.9}
								whileDrag={{ scale: 1.05 }}
								initial={{
									x: '-50%',
									y: 0,
									opacity: 0,
									scale: 0.8,
								}}
								animate={{
									x: '-50%',
									y: index * -5,
									opacity: 1,
									scale: 1 - index * 0.05,
									rotateZ: index % 2 === 0 ? -2 : 2,
								}}
								exit={{
									x: Math.random() > 0.5 ? 500 : -500,
									y: 0,
									opacity: 0,
									transition: { duration: 0.3 },
								}}
								onDragEnd={(e, info) => {
									if (Math.abs(info.offset.x) > 100) {
										removeCard(card.id);
										if (vibrationSupported)
											navigator.vibrate(40);
									}
								}}
								transition={{
									type: 'spring',
									stiffness: 100,
									damping: 15,
								}}
							>
								{card.content}
							</motion.div>
						))}
					</AnimatePresence>

					{cards.length === 0 && (
						<div
							style={{
								height: '100%',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								flexDirection: 'column',
							}}
						>
							<p>All cards dismissed</p>
							<button
								style={{ marginTop: '20px' }}
								onClick={resetCards}
							>
								Reset Cards
							</button>
						</div>
					)}
				</div>
				<p>
					Swipe cards left or right to dismiss them. This pattern is
					common in dating apps and other card-based UIs in both web
					and native applications.
				</p>
			</div>

			<div className='card'>
				<div className='card-header'>
					<h3>Web vs Capacitor vs Native Comparison</h3>
				</div>
				<table className='comparison-table'>
					<thead>
						<tr>
							<th>Feature</th>
							<th>React.js Web</th>
							<th>Capacitor</th>
							<th>React Native</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Animations</td>
							<td>
								CSS, Web Animations API, libraries like Framer
								Motion, React Spring
							</td>
							<td>
								Same as web, plus native plugins for smoother
								transitions
							</td>
							<td>
								Animated API, native drivers, Reanimated library
							</td>
						</tr>
						<tr>
							<td>Gestures</td>
							<td>
								Pointer events, touch events, gesture libraries
							</td>
							<td>
								Web gestures plus native gesture plugins
								available
							</td>
							<td>PanResponder, Gesture Handler</td>
						</tr>
						<tr>
							<td>Performance</td>
							<td>
								Good for simple animations; performance varies
								across browsers
							</td>
							<td>
								Improved performance over pure web by leveraging
								native plugins
							</td>
							<td>
								Best performance with native drivers and
								optimized native views
							</td>
						</tr>
						<tr>
							<td>60fps Animations</td>
							<td>
								Possible with optimization, but challenging for
								complex UI
							</td>
							<td>
								Easier to achieve with native plugins; moderate
								complexity
							</td>
							<td>
								Consistently achievable due to native rendering
							</td>
						</tr>
						<tr>
							<td>Memory Usage</td>
							<td>Higher due to browser overhead</td>
							<td>
								Moderate; native APIs can reduce browser
								overhead
							</td>
							<td>Lowest, direct native memory management</td>
						</tr>
						<tr>
							<td>Drag & Drop</td>
							<td>HTML5 Drag & Drop API, libraries</td>
							<td>
								Web-based drag/drop plus native gestures via
								plugins
							</td>
							<td>
								Custom implementations using PanResponder or
								Gesture Handler
							</td>
						</tr>
						<tr>
							<td>Distribution</td>
							<td>Web deployment only</td>
							<td>Web + App Stores (hybrid approach)</td>
							<td>App Stores only</td>
						</tr>
					</tbody>
				</table>
				<p style={{ marginTop: '15px' }}>
					<strong>React.js Web:</strong> Provides flexible and
					easy-to-use animation libraries with broad compatibility,
					though complex UI animations can be resource-intensive.
					<br />
					<strong>Capacitor:</strong> Combines web technologies with
					native plugins to enhance animation performance and gesture
					handling while maintaining web-based development
					convenience.
					<br />
					<strong>React Native:</strong> Offers the best performance
					and native-like animations and gestures at the cost of more
					complex setup and native-specific development.
				</p>
			</div>
		</div>
	);
};

export default UIAnimations;
